import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

type RevocableConnectionProvider = Pick<
  ConnectionProviderEntity,
  'id' | 'type' | 'oauthConfig'
>;

@Injectable()
export class AppOAuthRevokeService {
  private readonly logger = new Logger(AppOAuthRevokeService.name);

  constructor(
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
  ) {}

  // Best-effort: failures are logged but never block disconnect.
  async revokeIfApp(connectedAccount: ConnectedAccountEntity): Promise<void> {
    if (
      !isDefined(connectedAccount.connectionProviderId) ||
      !isDefined(connectedAccount.accessToken)
    ) {
      return;
    }

    let provider;

    try {
      provider = await this.connectionProviderService.findOneByIdOrThrow({
        id: connectedAccount.connectionProviderId,
        workspaceId: connectedAccount.workspaceId,
      });
    } catch {
      return;
    }

    let decryptedAccessToken: PlaintextString;

    try {
      decryptedAccessToken =
        this.connectedAccountTokenEncryptionService.decrypt({
          ciphertext: connectedAccount.accessToken,
          workspaceId: connectedAccount.workspaceId,
        });
    } catch (error) {
      this.logger.warn(
        `Provider revoke call failed for connected account ${connectedAccount.id}: ${(error as Error).message}`,
      );

      return;
    }

    await this.revokeToken({
      provider,
      token: decryptedAccessToken,
      tokenTypeHint: 'access_token',
      subject: `connected account ${connectedAccount.id}`,
    });
  }

  // Best-effort: releases a grant that was issued but could not be stored.
  async revokeUnstoredTokens({
    provider,
    accessToken,
    refreshToken,
  }: {
    provider: RevocableConnectionProvider;
    accessToken: PlaintextString;
    refreshToken: PlaintextString | null;
  }): Promise<void> {
    const subject = `an unstored grant of provider ${provider.id}`;

    await this.revokeToken({
      provider,
      token: accessToken,
      tokenTypeHint: 'access_token',
      subject,
    });

    if (isDefined(refreshToken)) {
      await this.revokeToken({
        provider,
        token: refreshToken,
        tokenTypeHint: 'refresh_token',
        subject,
      });
    }
  }

  private async revokeToken({
    provider,
    token,
    tokenTypeHint,
    subject,
  }: {
    provider: RevocableConnectionProvider;
    token: PlaintextString;
    tokenTypeHint: 'access_token' | 'refresh_token';
    subject: string;
  }): Promise<void> {
    const revokeEndpoint = provider.oauthConfig?.revokeEndpoint;

    if (provider.type !== 'oauth' || !isDefined(revokeEndpoint)) {
      return;
    }

    try {
      const response = await this.secureHttpClientService.createSsrfSafeFetch()(
        revokeEndpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token,
            token_type_hint: tokenTypeHint,
          }).toString(),
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `Provider ${provider.id} revoke endpoint responded with ${response.status} for ${subject}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Provider revoke call failed for ${subject}: ${(error as Error).message}`,
      );
    }
  }
}
