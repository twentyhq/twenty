import { createPublicKey } from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { decode, verify } from 'jsonwebtoken';
import { type ServerRouteBearerTokenVerification } from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { SERVER_ROUTE_BEARER_TOKEN_CLOCK_TOLERANCE_SECONDS } from 'src/engine/core-modules/server-route-trigger/constants/server-route-bearer-token-clock-tolerance-seconds.constant';
import { SERVER_ROUTE_JWKS_MAX_AGE_MS } from 'src/engine/core-modules/server-route-trigger/constants/server-route-jwks-max-age-ms.constant';
import { SERVER_ROUTE_JWKS_MIN_REFRESH_INTERVAL_MS } from 'src/engine/core-modules/server-route-trigger/constants/server-route-jwks-min-refresh-interval-ms.constant';
import {
  ServerRouteTriggerException,
  ServerRouteTriggerExceptionCode,
} from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { type ServerRouteSigningKey } from 'src/engine/core-modules/server-route-trigger/types/server-route-signing-key.type';
import { extractBearerToken } from 'src/engine/core-modules/server-route-trigger/utils/extract-bearer-token.util';
import { parseServerRouteSigningKeys } from 'src/engine/core-modules/server-route-trigger/utils/parse-server-route-signing-keys.util';

type FetchedSigningKeys = {
  keys: ServerRouteSigningKey[];
  fetchedAtMs: number;
};

const throwInvalidBearerToken = (reason: string): never => {
  throw new ServerRouteTriggerException(
    reason,
    ServerRouteTriggerExceptionCode.INVALID_BEARER_TOKEN,
  );
};

@Injectable()
export class ServerRouteBearerTokenVerifierService {
  private readonly signingKeysByJwksUrl = new Map<string, FetchedSigningKeys>();

  constructor(
    @InjectRepository(ApplicationRegistrationVariableEntity)
    private readonly applicationRegistrationVariableRepository: Repository<ApplicationRegistrationVariableEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async verifyOrThrow({
    authorizationHeader,
    bearerTokenVerification,
    applicationRegistrationId,
  }: {
    authorizationHeader: string | undefined;
    bearerTokenVerification: ServerRouteBearerTokenVerification;
    applicationRegistrationId: string;
  }): Promise<Record<string, unknown>> {
    const token = extractBearerToken(authorizationHeader);

    if (!isDefined(token)) {
      return throwInvalidBearerToken('Missing or malformed bearer token');
    }

    const keyId = decode(token, { complete: true })?.header.kid;

    if (!isNonEmptyString(keyId)) {
      return throwInvalidBearerToken('Bearer token names no signing key');
    }

    const audience = await this.findAudienceOrThrow({
      applicationRegistrationId,
      audienceServerVariable: bearerTokenVerification.audienceServerVariable,
    });

    const signingKey = await this.findSigningKeyOrThrow({
      jwksUrl: bearerTokenVerification.jwksUrl,
      keyId,
    });

    const { requiredKeyEndorsement } = bearerTokenVerification;

    if (
      isNonEmptyString(requiredKeyEndorsement) &&
      !(signingKey.endorsements ?? []).includes(requiredKeyEndorsement)
    ) {
      return throwInvalidBearerToken(
        `Bearer token signing key is not endorsed for ${requiredKeyEndorsement}`,
      );
    }

    let claims: unknown;

    try {
      claims = verify(
        token,
        createPublicKey({
          key: { kty: signingKey.kty, n: signingKey.n, e: signingKey.e },
          format: 'jwk',
        }),
        {
          algorithms: ['RS256'],
          issuer: bearerTokenVerification.issuer,
          audience,
          clockTolerance: SERVER_ROUTE_BEARER_TOKEN_CLOCK_TOLERANCE_SECONDS,
        },
      );
    } catch (error) {
      return throwInvalidBearerToken(
        `Bearer token verification failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }

    if (!isPlainObject(claims)) {
      return throwInvalidBearerToken('Bearer token carries no claims');
    }

    return claims;
  }

  private async findAudienceOrThrow({
    applicationRegistrationId,
    audienceServerVariable,
  }: {
    applicationRegistrationId: string;
    audienceServerVariable: string;
  }): Promise<string> {
    const variable =
      await this.applicationRegistrationVariableRepository.findOne({
        where: { applicationRegistrationId, key: audienceServerVariable },
      });

    const audience = isDefined(variable)
      ? this.secretEncryptionService.decryptVersionedOrThrow(
          variable.encryptedValue,
        )
      : '';

    if (!isNonEmptyString(audience)) {
      throw new ServerRouteTriggerException(
        `Server variable ${audienceServerVariable} holding the expected bearer token audience is not set`,
        ServerRouteTriggerExceptionCode.BEARER_TOKEN_VERIFICATION_UNAVAILABLE,
      );
    }

    return audience;
  }

  private async findSigningKeyOrThrow({
    jwksUrl,
    keyId,
  }: {
    jwksUrl: string;
    keyId: string;
  }): Promise<ServerRouteSigningKey> {
    const cachedSigningKeys = this.signingKeysByJwksUrl.get(jwksUrl);

    const signingKeys =
      isDefined(cachedSigningKeys) &&
      Date.now() - cachedSigningKeys.fetchedAtMs < SERVER_ROUTE_JWKS_MAX_AGE_MS
        ? cachedSigningKeys
        : await this.fetchSigningKeys(jwksUrl);

    const signingKey = signingKeys.keys.find((key) => key.kid === keyId);

    if (isDefined(signingKey)) {
      return signingKey;
    }

    if (
      Date.now() - signingKeys.fetchedAtMs <
      SERVER_ROUTE_JWKS_MIN_REFRESH_INTERVAL_MS
    ) {
      return throwInvalidBearerToken(
        'Bearer token is signed with a key the issuer does not publish',
      );
    }

    const refreshedSigningKey = (
      await this.fetchSigningKeys(jwksUrl)
    ).keys.find((key) => key.kid === keyId);

    if (!isDefined(refreshedSigningKey)) {
      return throwInvalidBearerToken(
        'Bearer token is signed with a key the issuer does not publish',
      );
    }

    return refreshedSigningKey;
  }

  private async fetchSigningKeys(jwksUrl: string): Promise<FetchedSigningKeys> {
    let jwksResponseBody: unknown;

    try {
      const response = await this.secureHttpClientService
        .getHttpClient()
        .get(jwksUrl);

      jwksResponseBody = response.data;
    } catch (error) {
      throw new ServerRouteTriggerException(
        `Could not fetch signing keys from ${jwksUrl}: ${error instanceof Error ? error.message : 'unknown error'}`,
        ServerRouteTriggerExceptionCode.BEARER_TOKEN_VERIFICATION_UNAVAILABLE,
      );
    }

    const fetchedSigningKeys = {
      keys: parseServerRouteSigningKeys(jwksResponseBody),
      fetchedAtMs: Date.now(),
    };

    this.signingKeysByJwksUrl.set(jwksUrl, fetchedSigningKeys);

    return fetchedSigningKeys;
  }
}
