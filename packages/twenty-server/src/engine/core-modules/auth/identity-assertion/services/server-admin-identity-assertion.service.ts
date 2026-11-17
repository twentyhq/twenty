import { Injectable, Logger } from '@nestjs/common';

import { createPublicKey, type KeyObject } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';
import * as z from 'zod';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { IDENTITY_ASSERTION_SIGNING_KEYS_FETCH_TIMEOUT_MS } from 'src/engine/core-modules/auth/identity-assertion/constants/identity-assertion-signing-keys-fetch-timeout-ms.constant';
import { IDENTITY_ASSERTION_SIGNING_KEYS_MAX_AGE_MS } from 'src/engine/core-modules/auth/identity-assertion/constants/identity-assertion-signing-keys-max-age-ms.constant';
import { IDENTITY_ASSERTION_SIGNING_KEYS_MIN_REFETCH_INTERVAL_MS } from 'src/engine/core-modules/auth/identity-assertion/constants/identity-assertion-signing-keys-min-refetch-interval-ms.constant';
import { type IdentityAssertionRefusalReason } from 'src/engine/core-modules/auth/identity-assertion/types/identity-assertion-refusal-reason.type';
import { getIdentityAssertionKeyId } from 'src/engine/core-modules/auth/identity-assertion/utils/get-identity-assertion-key-id.util';
import { verifyIdentityAssertion } from 'src/engine/core-modules/auth/identity-assertion/utils/verify-identity-assertion.util';
import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { isServerAdminWorkspace } from 'src/engine/core-modules/impersonation/utils/is-server-admin-workspace.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const SIGNING_KEY_SET_SCHEMA = z.object({ keys: z.array(z.unknown()) });

const SIGNING_KEY_SCHEMA = z.discriminatedUnion('kty', [
  z.object({
    kid: z.string(),
    kty: z.literal('RSA'),
    n: z.string(),
    e: z.string(),
  }),
  z.object({
    kid: z.string(),
    kty: z.literal('EC'),
    crv: z.string(),
    x: z.string(),
    y: z.string(),
  }),
]);

@Injectable()
export class ServerAdminIdentityAssertionService {
  private readonly logger = new Logger(
    ServerAdminIdentityAssertionService.name,
  );
  private signingKeysByKeyId = new Map<string, KeyObject>();
  private signingKeysUrl: string | undefined;
  private signingKeysFetchedAt: number | undefined;
  private signingKeysFetch: Promise<void> | undefined;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async assertRequestAllowedInServerAdminWorkspaceOrThrow({
    request,
    authContext,
  }: {
    request: Pick<Request, 'headers'>;
    authContext: Pick<RawAuthContext, 'workspace' | 'user'>;
  }): Promise<void> {
    const serverAdminWorkspaceId = this.twentyConfigService.get(
      'SERVER_ADMIN_WORKSPACE_ID',
    );
    const header = this.twentyConfigService.get(
      'SERVER_ADMIN_IDENTITY_ASSERTION_HEADER',
    );
    const signingKeysUrl = this.twentyConfigService.get(
      'SERVER_ADMIN_IDENTITY_ASSERTION_JWKS_URL',
    );
    const issuer = this.twentyConfigService.get(
      'SERVER_ADMIN_IDENTITY_ASSERTION_ISSUER',
    );
    const audience = this.twentyConfigService.get(
      'SERVER_ADMIN_IDENTITY_ASSERTION_AUDIENCE',
    );

    if (
      !isDefined(serverAdminWorkspaceId) ||
      !isDefined(header) ||
      !isDefined(signingKeysUrl) ||
      !isDefined(issuer) ||
      !isDefined(audience)
    ) {
      return;
    }

    const workspaceId = authContext.workspace?.id;

    if (!isServerAdminWorkspace({ workspaceId, serverAdminWorkspaceId })) {
      return;
    }

    const refusal = await this.findRefusal({
      assertion: request.headers[header.toLowerCase()],
      userEmail: authContext.user?.email,
      signingKeysUrl,
      issuer,
      audience,
    });

    if (!isDefined(refusal)) {
      return;
    }

    const logAttributes = [
      `reason=${refusal.reason}`,
      isDefined(refusal.detail) ? `detail="${refusal.detail}"` : undefined,
      `workspaceId=${workspaceId}`,
      isDefined(authContext.user) ? `userId=${authContext.user.id}` : undefined,
    ]
      .filter(isDefined)
      .join(' ');

    this.logger.warn(`Identity assertion refused: ${logAttributes}`);

    throw new AuthException(
      'The server admin workspace requires a valid identity assertion',
      AuthExceptionCode.IDENTITY_ASSERTION_REQUIRED,
    );
  }

  private async findRefusal({
    assertion,
    userEmail,
    signingKeysUrl,
    issuer,
    audience,
  }: {
    assertion: string | string[] | undefined;
    userEmail: string | undefined;
    signingKeysUrl: string;
    issuer: string;
    audience: string;
  }): Promise<
    { reason: IdentityAssertionRefusalReason; detail?: string } | undefined
  > {
    if (!isNonEmptyString(assertion)) {
      return { reason: 'ASSERTION_MISSING' };
    }

    const signingKey = await this.findSigningKey({
      keyId: getIdentityAssertionKeyId(assertion),
      signingKeysUrl,
    });

    if (!isDefined(signingKey)) {
      return { reason: 'SIGNING_KEY_UNKNOWN' };
    }

    const verification = verifyIdentityAssertion({
      assertion,
      signingKey,
      issuer,
      audience,
    });

    if (!verification.isValid) {
      return { reason: 'ASSERTION_INVALID', detail: verification.error };
    }

    if (
      !isDefined(verification.email) ||
      !isDefined(userEmail) ||
      verification.email.toLowerCase() !== userEmail.toLowerCase()
    ) {
      return { reason: 'EMAIL_MISMATCH' };
    }

    return undefined;
  }

  private async findSigningKey({
    keyId,
    signingKeysUrl,
  }: {
    keyId: string | undefined;
    signingKeysUrl: string;
  }): Promise<KeyObject | undefined> {
    if (!isDefined(keyId)) {
      return undefined;
    }

    if (this.shouldFetchSigningKeys({ keyId, signingKeysUrl })) {
      this.signingKeysFetch ??= this.fetchSigningKeys(signingKeysUrl).finally(
        () => {
          this.signingKeysFetch = undefined;
        },
      );
    }

    await this.signingKeysFetch;

    return this.signingKeysByKeyId.get(keyId);
  }

  private shouldFetchSigningKeys({
    keyId,
    signingKeysUrl,
  }: {
    keyId: string;
    signingKeysUrl: string;
  }): boolean {
    if (
      !isDefined(this.signingKeysFetchedAt) ||
      this.signingKeysUrl !== signingKeysUrl
    ) {
      return true;
    }

    const signingKeysAgeMs = Date.now() - this.signingKeysFetchedAt;

    if (signingKeysAgeMs > IDENTITY_ASSERTION_SIGNING_KEYS_MAX_AGE_MS) {
      return true;
    }

    // Issuers rotate their keys, so an unknown key id is worth one refetch, throttled against forged ids.
    return (
      !this.signingKeysByKeyId.has(keyId) &&
      signingKeysAgeMs > IDENTITY_ASSERTION_SIGNING_KEYS_MIN_REFETCH_INTERVAL_MS
    );
  }

  private async fetchSigningKeys(signingKeysUrl: string): Promise<void> {
    if (this.signingKeysUrl !== signingKeysUrl) {
      this.signingKeysByKeyId = new Map();
      this.signingKeysUrl = signingKeysUrl;
    }

    try {
      const response = await this.secureHttpClientService
        .getHttpClient({
          timeout: IDENTITY_ASSERTION_SIGNING_KEYS_FETCH_TIMEOUT_MS,
        })
        .get<unknown>(signingKeysUrl);

      const { keys } = SIGNING_KEY_SET_SCHEMA.parse(response.data);

      this.signingKeysByKeyId = new Map(
        keys.flatMap((key) => {
          const signingKey = SIGNING_KEY_SCHEMA.safeParse(key);

          if (!signingKey.success) {
            return [];
          }

          const { kid, ...jsonWebKey } = signingKey.data;

          return [[kid, createPublicKey({ key: jsonWebKey, format: 'jwk' })]];
        }),
      );
    } catch (error) {
      this.logger.error(
        `Could not fetch the identity assertion signing keys from ${signingKeysUrl}`,
        error,
      );
    } finally {
      this.signingKeysFetchedAt = Date.now();
    }
  }
}
