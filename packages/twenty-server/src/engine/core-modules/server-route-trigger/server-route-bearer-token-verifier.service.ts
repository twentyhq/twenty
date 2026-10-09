import { createPublicKey } from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { decode, verify } from 'jsonwebtoken';
import { type ServerRouteBearerTokenVerification } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';
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
  private readonly signingKeysFetchByJwksUrl = new Map<
    string,
    Promise<ServerRouteSigningKey[]>
  >();
  private readonly lastSigningKeysFetchAttemptAtMsByJwksUrl = new Map<
    string,
    number
  >();

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

    const cachedSigningKey =
      isDefined(cachedSigningKeys) &&
      Date.now() - cachedSigningKeys.fetchedAtMs < SERVER_ROUTE_JWKS_MAX_AGE_MS
        ? cachedSigningKeys.keys.find((key) => key.kid === keyId)
        : undefined;

    if (isDefined(cachedSigningKey)) {
      return cachedSigningKey;
    }

    const signingKey = (await this.loadSigningKeysOrThrow(jwksUrl)).find(
      (key) => key.kid === keyId,
    );

    if (!isDefined(signingKey)) {
      return throwInvalidBearerToken(
        'Bearer token is signed with a key the issuer does not publish',
      );
    }

    return signingKey;
  }

  // Forged tokens naming unknown keys must not turn every request into a
  // fetch, so fetches are shared while in flight and paced across attempts.
  private async loadSigningKeysOrThrow(
    jwksUrl: string,
  ): Promise<ServerRouteSigningKey[]> {
    const inFlightFetch = this.signingKeysFetchByJwksUrl.get(jwksUrl);

    if (isDefined(inFlightFetch)) {
      return await inFlightFetch;
    }

    const lastFetchAttemptAtMs =
      this.lastSigningKeysFetchAttemptAtMsByJwksUrl.get(jwksUrl);

    if (
      isDefined(lastFetchAttemptAtMs) &&
      Date.now() - lastFetchAttemptAtMs <
        SERVER_ROUTE_JWKS_MIN_REFRESH_INTERVAL_MS
    ) {
      return this.getCachedSigningKeysOrThrow({
        jwksUrl,
        reason: 'the last fetch attempt failed moments ago',
      });
    }

    this.lastSigningKeysFetchAttemptAtMsByJwksUrl.set(jwksUrl, Date.now());

    const signingKeysFetch = this.fetchSigningKeysOrThrow(jwksUrl).finally(() =>
      this.signingKeysFetchByJwksUrl.delete(jwksUrl),
    );

    this.signingKeysFetchByJwksUrl.set(jwksUrl, signingKeysFetch);

    return await signingKeysFetch;
  }

  private async fetchSigningKeysOrThrow(
    jwksUrl: string,
  ): Promise<ServerRouteSigningKey[]> {
    let jwksResponseBody: unknown;

    try {
      const response = await this.secureHttpClientService
        .getHttpClient()
        .get(jwksUrl);

      jwksResponseBody = response.data;
    } catch (error) {
      return this.getCachedSigningKeysOrThrow({
        jwksUrl,
        reason: error instanceof Error ? error.message : 'unknown error',
      });
    }

    const keys = parseServerRouteSigningKeys(jwksResponseBody);

    if (!isNonEmptyArray(keys)) {
      return this.getCachedSigningKeysOrThrow({
        jwksUrl,
        reason: 'the response carried no usable RSA signing key',
      });
    }

    this.signingKeysByJwksUrl.set(jwksUrl, { keys, fetchedAtMs: Date.now() });

    return keys;
  }

  private getCachedSigningKeysOrThrow({
    jwksUrl,
    reason,
  }: {
    jwksUrl: string;
    reason: string;
  }): ServerRouteSigningKey[] {
    const cachedSigningKeys = this.signingKeysByJwksUrl.get(jwksUrl);

    if (!isDefined(cachedSigningKeys)) {
      throw new ServerRouteTriggerException(
        `Could not load signing keys from ${jwksUrl}: ${reason}`,
        ServerRouteTriggerExceptionCode.BEARER_TOKEN_VERIFICATION_UNAVAILABLE,
      );
    }

    return cachedSigningKeys.keys;
  }
}
