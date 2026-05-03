import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationOAuthProviderService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class AppOAuthRevokeService {
  private readonly logger = new Logger(AppOAuthRevokeService.name);

  constructor(
    private readonly applicationOAuthProviderService: ApplicationOAuthProviderService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  // Best-effort revoke against the provider's `revokeEndpoint` if declared
  // in the manifest. Failures are swallowed (logged as warnings) so a
  // disconnect always succeeds locally even when the provider is down or
  // doesn't support revocation. RFC 7009 form-urlencoded body is the
  // de-facto standard.
  async revokeIfApp(connectedAccount: ConnectedAccountEntity): Promise<void> {
    if (
      !isDefined(connectedAccount.applicationConnectionProviderId) ||
      !isDefined(connectedAccount.accessToken)
    ) {
      return;
    }

    let provider;

    try {
      provider = await this.applicationOAuthProviderService.findOneByIdOrThrow(
        connectedAccount.applicationConnectionProviderId,
      );
    } catch {
      return;
    }

    if (!provider.revokeEndpoint) {
      return;
    }

    try {
      const response = await this.secureHttpClientService.createSsrfSafeFetch()(
        provider.revokeEndpoint,
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
