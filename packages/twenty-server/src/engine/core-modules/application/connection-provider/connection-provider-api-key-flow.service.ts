import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

type ConnectWithApiKeyArgs = {
  applicationId: string;
  providerName: string;
  apiKey: string;
  workspaceId: string;
  userId: string;
  userWorkspaceId: string;
  reconnectingConnectedAccountId: string | null;
};

@Injectable()
export class ConnectionProviderApiKeyFlowService {
  constructor(
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly connectedAccountService: ConnectionProviderConnectedAccountService,
    private readonly connectionProviderLifecycleHookService: ConnectionProviderLifecycleHookService,
  ) {}

  async connect({
    applicationId,
    providerName,
    apiKey,
    workspaceId,
    userId,
    userWorkspaceId,
    reconnectingConnectedAccountId,
  }: ConnectWithApiKeyArgs): Promise<string> {
    const provider =
      await this.connectionProviderService.findOneByApplicationAndName({
        applicationId,
        name: providerName,
        workspaceId,
      });

    if (!isDefined(provider)) {
      throw new ConnectionProviderException(
        `Connection provider "${providerName}" not found for application ${applicationId}`,
        ConnectionProviderExceptionCode.PROVIDER_NOT_FOUND,
      );
    }

    if (provider.type !== 'apiKey') {
      throw new ConnectionProviderException(
        `Connection provider "${provider.name}" (id ${provider.id}) is not apiKey-typed`,
        ConnectionProviderExceptionCode.INVALID_REQUEST,
      );
    }

    await this.connectedAccountService.assertCallerCanConnectOrThrow({
      connectionProviderId: provider.id,
      workspaceId,
      userWorkspaceId,
      scope: provider.scope,
      reconnectingConnectedAccountId,
    });

    const identifiedAccount = await this.connectionProviderLifecycleHookService
      .runIdentifyAccount({ provider, workspaceId, accessToken: apiKey })
      .catch((error: unknown) => {
        if (
          error instanceof ConnectionProviderException &&
          error.code ===
            ConnectionProviderExceptionCode.IDENTIFY_ACCOUNT_LOGIC_FUNCTION_FAILED
        ) {
          const providerDisplayName = provider.displayName;

          throw new ConnectionProviderException(
            error.message,
            ConnectionProviderExceptionCode.INVALID_API_KEY,
            {
              userFriendlyMessage: msg`The ${providerDisplayName} API key was rejected. Check it and try again.`,
            },
          );
        }

        throw error;
      });

    const connectedAccount = await this.connectedAccountService.persist({
      provider,
      credentials: {
        accessToken: plaintextStringSchema.parse(apiKey),
        refreshToken: null,
        scopes: null,
      },
      handle: identifiedAccount?.handle,
      identifiedAccount,
      workspaceId,
      userId,
      userWorkspaceId,
      scope: provider.scope,
      reconnectingConnectedAccountId,
    });

    await this.connectionProviderLifecycleHookService.dispatchOnConnect({
      provider,
      workspaceId,
      connectedAccountId: connectedAccount.id,
    });

    return connectedAccount.id;
  }
}
