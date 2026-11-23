import { Injectable, Logger } from '@nestjs/common';

import { type KeyObject } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { IDENTITY_ASSERTION_SIGNING_KEYS_FETCH_TIMEOUT_MS } from 'src/engine/core-modules/auth/identity-assertion/constants/identity-assertion-signing-keys-fetch-timeout-ms.constant';
import { type IdentityAssertionSigningKeySet } from 'src/engine/core-modules/auth/identity-assertion/types/identity-assertion-signing-key-set.type';
import { type IdentityAssertionRefusalReason } from 'src/engine/core-modules/auth/identity-assertion/types/identity-assertion-refusal-reason.type';
import { areIdentityAssertionSigningKeysFresh } from 'src/engine/core-modules/auth/identity-assertion/utils/are-identity-assertion-signing-keys-fresh.util';
import { getIdentityAssertionKeyId } from 'src/engine/core-modules/auth/identity-assertion/utils/get-identity-assertion-key-id.util';
import { parseIdentityAssertionSigningKeys } from 'src/engine/core-modules/auth/identity-assertion/utils/parse-identity-assertion-signing-keys.util';
import { shouldFetchIdentityAssertionSigningKeys } from 'src/engine/core-modules/auth/identity-assertion/utils/should-fetch-identity-assertion-signing-keys.util';
import { verifyIdentityAssertion } from 'src/engine/core-modules/auth/identity-assertion/utils/verify-identity-assertion.util';
import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { isServerAdminWorkspace } from 'src/engine/core-modules/impersonation/utils/is-server-admin-workspace.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class ServerAdminIdentityAssertionService {
  private readonly logger = new Logger(
    ServerAdminIdentityAssertionService.name,
  );
  private readonly signingKeySetsByUrl = new Map<
    string,
    IdentityAssertionSigningKeySet
  >();

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

    const isIdentityAssertionConfigured =
      isDefined(header) ||
      isDefined(signingKeysUrl) ||
      isDefined(issuer) ||
      isDefined(audience);

    if (!isIdentityAssertionConfigured || !isDefined(serverAdminWorkspaceId)) {
      return;
    }

    const workspaceId = authContext.workspace?.id;

    if (!isServerAdminWorkspace({ workspaceId, serverAdminWorkspaceId })) {
      return;
    }

    const refusal = await this.findRefusal({
      requestHeaders: request.headers,
      userEmail: authContext.user?.email,
      header,
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
    requestHeaders,
    userEmail,
    header,
    signingKeysUrl,
    issuer,
    audience,
  }: {
    requestHeaders: Request['headers'];
    userEmail: string | undefined;
    header: string | undefined;
    signingKeysUrl: string | undefined;
    issuer: string | undefined;
    audience: string | undefined;
  }): Promise<
    { reason: IdentityAssertionRefusalReason; detail?: string } | undefined
  > {
    // A partial configuration must never leave the workspace open.
    if (
      !isDefined(header) ||
      !isDefined(signingKeysUrl) ||
      !isDefined(issuer) ||
      !isDefined(audience)
    ) {
      return { reason: 'CONFIGURATION_INCOMPLETE' };
    }

    const assertion = requestHeaders[header.toLowerCase()];

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

    const signingKeySet = this.getSigningKeySet(signingKeysUrl);
    const cachedSigningKey = this.findFreshSigningKey({ signingKeySet, keyId });

    if (isDefined(cachedSigningKey)) {
      return cachedSigningKey;
    }

    if (
      shouldFetchIdentityAssertionSigningKeys({
        fetchedAt: signingKeySet.fetchedAt,
        fetchAttemptedAt: signingKeySet.fetchAttemptedAt,
        isSigningKeyKnown: signingKeySet.keysByKeyId.has(keyId),
        now: Date.now(),
      })
    ) {
      signingKeySet.fetch ??= this.fetchSigningKeys({
        signingKeysUrl,
        signingKeySet,
      }).finally(() => {
        signingKeySet.fetch = undefined;
      });
    }

    await signingKeySet.fetch;

    return this.findFreshSigningKey({ signingKeySet, keyId });
  }

  private getSigningKeySet(
    signingKeysUrl: string,
  ): IdentityAssertionSigningKeySet {
    const existingSigningKeySet = this.signingKeySetsByUrl.get(signingKeysUrl);

    if (isDefined(existingSigningKeySet)) {
      return existingSigningKeySet;
    }

    const signingKeySet: IdentityAssertionSigningKeySet = {
      keysByKeyId: new Map(),
      fetchedAt: undefined,
      fetchAttemptedAt: undefined,
      fetch: undefined,
    };

    this.signingKeySetsByUrl.set(signingKeysUrl, signingKeySet);

    return signingKeySet;
  }

  private findFreshSigningKey({
    signingKeySet,
    keyId,
  }: {
    signingKeySet: IdentityAssertionSigningKeySet;
    keyId: string;
  }): KeyObject | undefined {
    if (
      !areIdentityAssertionSigningKeysFresh({
        fetchedAt: signingKeySet.fetchedAt,
        now: Date.now(),
      })
    ) {
      return undefined;
    }

    return signingKeySet.keysByKeyId.get(keyId);
  }

  private async fetchSigningKeys({
    signingKeysUrl,
    signingKeySet,
  }: {
    signingKeysUrl: string;
    signingKeySet: IdentityAssertionSigningKeySet;
  }): Promise<void> {
    signingKeySet.fetchAttemptedAt = Date.now();

    try {
      const response = await this.secureHttpClientService
        .getHttpClient({
          timeout: IDENTITY_ASSERTION_SIGNING_KEYS_FETCH_TIMEOUT_MS,
          maxRedirects: 0,
        })
        .get<unknown>(signingKeysUrl);

      signingKeySet.keysByKeyId = parseIdentityAssertionSigningKeys(
        response.data,
      );
      signingKeySet.fetchedAt = Date.now();
    } catch (error) {
      this.logger.error(
        `Could not fetch the identity assertion signing keys from ${signingKeysUrl}`,
        error,
      );
    }
  }
}
