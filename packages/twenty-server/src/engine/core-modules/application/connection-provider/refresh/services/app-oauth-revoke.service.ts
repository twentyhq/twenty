import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class AppOAuthRevokeService {
  private readonly logger = new Logger(AppOAuthRevokeService.name);

  constructor(
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly secureHttpClientService: SecureHttpClientService,
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
      provider = await this.connectionProviderService.findOneByIdOrThrow(
        connectedAccount.connectionProviderId,
      );
    } catch {
      return;
    }

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
            token: connectedAccount.accessToken,
            token_type_hint: 'access_token',
          }).toString(),
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `Provider ${provider.id} revoke endpoint responded with ${response.status} for connected account ${connectedAccount.id}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Provider revoke call failed for connected account ${connectedAccount.id}: ${(error as Error).message}`,
      );
    }
  }
}
