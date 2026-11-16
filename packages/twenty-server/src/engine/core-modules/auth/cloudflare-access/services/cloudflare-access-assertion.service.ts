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
import { CLOUDFLARE_ACCESS_ASSERTION_HEADER } from 'src/engine/core-modules/auth/cloudflare-access/constants/cloudflare-access-assertion-header.constant';
import { CLOUDFLARE_ACCESS_SIGNING_KEYS_FETCH_TIMEOUT_MS } from 'src/engine/core-modules/auth/cloudflare-access/constants/cloudflare-access-signing-keys-fetch-timeout-ms.constant';
import { CLOUDFLARE_ACCESS_SIGNING_KEYS_MAX_AGE_MS } from 'src/engine/core-modules/auth/cloudflare-access/constants/cloudflare-access-signing-keys-max-age-ms.constant';
import { CLOUDFLARE_ACCESS_SIGNING_KEYS_MIN_REFETCH_INTERVAL_MS } from 'src/engine/core-modules/auth/cloudflare-access/constants/cloudflare-access-signing-keys-min-refetch-interval-ms.constant';
import { CLOUDFLARE_ACCESS_SIGNING_KEYS_PATH } from 'src/engine/core-modules/auth/cloudflare-access/constants/cloudflare-access-signing-keys-path.constant';
import { type CloudflareAccessAssertionRefusalReason } from 'src/engine/core-modules/auth/cloudflare-access/types/cloudflare-access-assertion-refusal-reason.type';
import { getCloudflareAccessAssertionKeyId } from 'src/engine/core-modules/auth/cloudflare-access/utils/get-cloudflare-access-assertion-key-id.util';
import { verifyCloudflareAccessAssertion } from 'src/engine/core-modules/auth/cloudflare-access/utils/verify-cloudflare-access-assertion.util';
import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { isServerAdminWorkspace } from 'src/engine/core-modules/impersonation/utils/is-server-admin-workspace.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const CLOUDFLARE_ACCESS_SIGNING_KEYS_SCHEMA = z.object({
  keys: z.array(
    z.object({
      kid: z.string(),
      kty: z.literal('RSA'),
      n: z.string(),
      e: z.string(),
    }),
  ),
});

@Injectable()
export class CloudflareAccessAssertionService {
  private readonly logger = new Logger(CloudflareAccessAssertionService.name);
  private signingKeysByKeyId = new Map<string, KeyObject>();
  private signingKeysIssuer: string | undefined;
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
    const issuerUrl = this.twentyConfigService.get(
      'CLOUDFLARE_ACCESS_ISSUER_URL',
    );
    const audience = this.twentyConfigService.get(
      'CLOUDFLARE_ACCESS_SERVER_ADMIN_AUDIENCE',
    );

    if (
      !isDefined(serverAdminWorkspaceId) ||
      !isDefined(issuerUrl) ||
      !isDefined(audience)
    ) {
      return;
    }

    const workspaceId = authContext.workspace?.id;

    if (!isServerAdminWorkspace({ workspaceId, serverAdminWorkspaceId })) {
      return;
    }

    const refusal = await this.findRefusal({
      assertion: request.headers[CLOUDFLARE_ACCESS_ASSERTION_HEADER],
      userEmail: authContext.user?.email,
      issuer: new URL(issuerUrl).origin,
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

    this.logger.warn(`Cloudflare Access assertion refused: ${logAttributes}`);

    throw new AuthException(
      'The server admin workspace requires a valid Cloudflare Access assertion',
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
    );
  }

  private async findRefusal({
    assertion,
    userEmail,
    issuer,
    audience,
  }: {
    assertion: string | string[] | undefined;
    userEmail: string | undefined;
    issuer: string;
    audience: string;
  }): Promise<
    | { reason: CloudflareAccessAssertionRefusalReason; detail?: string }
    | undefined
  > {
    if (!isNonEmptyString(assertion)) {
      return { reason: 'ASSERTION_MISSING' };
    }

    const signingKey = await this.findSigningKey({
      keyId: getCloudflareAccessAssertionKeyId(assertion),
      issuer,
    });

    if (!isDefined(signingKey)) {
      return { reason: 'SIGNING_KEY_UNKNOWN' };
    }

    const verification = verifyCloudflareAccessAssertion({
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
    issuer,
  }: {
    keyId: string | undefined;
    issuer: string;
  }): Promise<KeyObject | undefined> {
    if (!isDefined(keyId)) {
      return undefined;
    }

    if (this.shouldFetchSigningKeys({ keyId, issuer })) {
      this.signingKeysFetch ??= this.fetchSigningKeys(issuer).finally(() => {
        this.signingKeysFetch = undefined;
      });
    }

    await this.signingKeysFetch;

    return this.signingKeysByKeyId.get(keyId);
  }

  private shouldFetchSigningKeys({
    keyId,
    issuer,
  }: {
    keyId: string;
    issuer: string;
  }): boolean {
    if (
      !isDefined(this.signingKeysFetchedAt) ||
      this.signingKeysIssuer !== issuer
    ) {
      return true;
    }

    const signingKeysAgeMs = Date.now() - this.signingKeysFetchedAt;

    if (signingKeysAgeMs > CLOUDFLARE_ACCESS_SIGNING_KEYS_MAX_AGE_MS) {
      return true;
    }

    // Cloudflare rotates its keys, so an unknown key id is worth one refetch, throttled against forged ids.
    return (
      !this.signingKeysByKeyId.has(keyId) &&
      signingKeysAgeMs > CLOUDFLARE_ACCESS_SIGNING_KEYS_MIN_REFETCH_INTERVAL_MS
    );
  }

  private async fetchSigningKeys(issuer: string): Promise<void> {
    if (this.signingKeysIssuer !== issuer) {
      this.signingKeysByKeyId = new Map();
      this.signingKeysIssuer = issuer;
    }

    try {
      const response = await this.secureHttpClientService
        .getHttpClient({
          timeout: CLOUDFLARE_ACCESS_SIGNING_KEYS_FETCH_TIMEOUT_MS,
        })
        .get<unknown>(`${issuer}${CLOUDFLARE_ACCESS_SIGNING_KEYS_PATH}`);

      const { keys } = CLOUDFLARE_ACCESS_SIGNING_KEYS_SCHEMA.parse(
        response.data,
      );

      this.signingKeysByKeyId = new Map(
        keys.map(({ kid, kty, n, e }) => [
          kid,
          createPublicKey({ key: { kty, n, e }, format: 'jwk' }),
        ]),
      );
    } catch (error) {
      this.logger.error(
        `Could not fetch the Cloudflare Access signing keys from ${issuer}`,
        error,
      );
    } finally {
      this.signingKeysFetchedAt = Date.now();
    }
  }
}
