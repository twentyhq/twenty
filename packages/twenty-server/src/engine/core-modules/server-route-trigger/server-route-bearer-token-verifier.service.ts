import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { type ServerRouteBearerTokenVerification } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { decodeJwtHeader } from 'src/engine/core-modules/jwt/utils/decode-jwt-header.util';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { SERVER_ROUTE_JWKS_MAX_AGE_MS } from 'src/engine/core-modules/server-route-trigger/constants/server-route-jwks-max-age-ms.constant';
import { SERVER_ROUTE_JWKS_MIN_REFRESH_INTERVAL_MS } from 'src/engine/core-modules/server-route-trigger/constants/server-route-jwks-min-refresh-interval-ms.constant';
import {
  ServerRouteTriggerException,
  ServerRouteTriggerExceptionCode,
} from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { type ServerRouteSigningKey } from 'src/engine/core-modules/server-route-trigger/types/server-route-signing-key.type';
import { extractBearerToken } from 'src/engine/core-modules/server-route-trigger/utils/extract-bearer-token.util';
import { parseServerRouteSigningKeys } from 'src/engine/core-modules/server-route-trigger/utils/parse-server-route-signing-keys.util';
import { verifyServerRouteBearerToken } from 'src/engine/core-modules/server-route-trigger/utils/verify-server-route-bearer-token.util';

type FetchedSigningKeys = {
  keys: ServerRouteSigningKey[];
  fetchedAtMs: number;
};

@Injectable()
export class ServerRouteBearerTokenVerifierService {
  private readonly logger = new Logger(
    ServerRouteBearerTokenVerifierService.name,
  );
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
      return this.throwInvalidBearerToken('Missing or malformed bearer token');
    }

    const keyId = decodeJwtHeader(token)?.kid;

    if (!isNonEmptyString(keyId)) {
      return this.throwInvalidBearerToken('Bearer token names no signing key');
    }

    const signingKey = await this.findSigningKeyOrThrow({
      jwksUrl: bearerTokenVerification.jwksUrl,
      keyId,
    });

    const audience = await this.findAudienceOrThrow({
      applicationRegistrationId,
      audienceServerVariable: bearerTokenVerification.audienceServerVariable,
    });

    const verification = verifyServerRouteBearerToken({
      token,
      signingKey,
      issuer: bearerTokenVerification.issuer,
      audience,
      requiredKeyEndorsement: bearerTokenVerification.requiredKeyEndorsement,
    });

    if (!verification.isValid) {
      return this.throwInvalidBearerToken(verification.reason);
    }

    return verification.claims;
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

    if (!isDefined(variable)) {
      return this.throwBearerTokenVerificationUnavailable(
        `Server variable ${audienceServerVariable} holding the expected bearer token audience is not declared`,
      );
    }

    const audience = this.secretEncryptionService.decryptVersionedOrThrow(
      variable.encryptedValue,
    );

    if (!isNonEmptyString(audience)) {
      return this.throwBearerTokenVerificationUnavailable(
        `Server variable ${audienceServerVariable} holding the expected bearer token audience is not set`,
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
      return this.throwInvalidBearerToken(
        'Bearer token is signed with a key the issuer does not publish',
      );
    }

    return signingKey;
  }

  // Forged tokens naming unknown keys must not turn every request into a fetch.
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
    const keys = parseServerRouteSigningKeys(
      await this.fetchJwksResponseBody(jwksUrl),
    );

    if (!isNonEmptyArray(keys)) {
      return this.getCachedSigningKeysOrThrow({
        jwksUrl,
        reason: 'no usable RSA signing key was fetched',
      });
    }

    this.signingKeysByJwksUrl.set(jwksUrl, { keys, fetchedAtMs: Date.now() });

    return keys;
  }

  private async fetchJwksResponseBody(jwksUrl: string): Promise<unknown> {
    try {
      const response = await this.secureHttpClientService
        .getHttpClient()
        .get(jwksUrl);

      return response.data;
    } catch (error) {
      this.logger.warn(
        `Could not fetch signing keys from ${jwksUrl}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return undefined;
    }
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
      return this.throwBearerTokenVerificationUnavailable(
        `Could not load signing keys from ${jwksUrl}: ${reason}`,
      );
    }

    return cachedSigningKeys.keys;
  }

  // The message reaches unauthenticated callers, so the reason is only logged.
  private throwInvalidBearerToken(reason: string): never {
    this.logger.warn(`Rejected server route bearer token: ${reason}`);

    throw new ServerRouteTriggerException(
      'Bearer token is invalid',
      ServerRouteTriggerExceptionCode.INVALID_BEARER_TOKEN,
    );
  }

  private throwBearerTokenVerificationUnavailable(reason: string): never {
    this.logger.error(
      `Server route bearer token verification is unavailable: ${reason}`,
    );

    throw new ServerRouteTriggerException(
      'Bearer token verification is unavailable',
      ServerRouteTriggerExceptionCode.BEARER_TOKEN_VERIFICATION_UNAVAILABLE,
    );
  }
}
