import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type IdentifiedAccount } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
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

// No redirect: the member submits the key from Twenty itself, so the flow is a single request
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
  }: ConnectWithApiKeyArgs): Promise<{ connectedAccountId: string }> {
    const provider = await this.findApiKeyProviderOrThrow({
      applicationId,
      providerName,
      workspaceId,
    });

    await this.connectedAccountService.assertCallerCanConnectOrThrow({
      connectionProviderId: provider.id,
      workspaceId,
      userWorkspaceId,
      scope: provider.scope,
      reconnectingConnectedAccountId,
    });

    const trimmedApiKey = apiKey.trim();

    if (!isNonEmptyString(trimmedApiKey)) {
      throw new ConnectionProviderException(
        'API key is empty',
        ConnectionProviderExceptionCode.INVALID_REQUEST,
        { userFriendlyMessage: msg`Enter an API key.` },
      );
    }

    const identifiedAccount = await this.identifyAccountOrThrow({
      provider,
      workspaceId,
      apiKey: trimmedApiKey,
    });

    const connectedAccount = await this.connectedAccountService.persist({
      provider,
      credentials: {
        accessToken: plaintextStringSchema.parse(trimmedApiKey),
        refreshToken: null,
        scopes: null,
      },
      handle:
        identifiedAccount?.handle ??
        (await this.connectedAccountService.resolveHandle({
          idToken: null,
          userId,
        })),
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

    return { connectedAccountId: connectedAccount.id };
  }

  private async findApiKeyProviderOrThrow({
    applicationId,
    providerName,
    workspaceId,
  }: {
    applicationId: string;
    providerName: string;
    workspaceId: string;
  }): Promise<ConnectionProviderEntity> {
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

    if (provider.type !== 'api-key') {
      throw new ConnectionProviderException(
        `Connection provider "${providerName}" (id ${provider.id}) is not api-key-typed`,
        ConnectionProviderExceptionCode.INVALID_REQUEST,
      );
    }

    return provider;
  }

  // A throw can mean a wrong key or an unreachable service; only the app knows which, so the member gets both
  private async identifyAccountOrThrow({
    provider,
    workspaceId,
    apiKey,
  }: {
    provider: ConnectionProviderEntity;
    workspaceId: string;
    apiKey: string;
  }): Promise<IdentifiedAccount | null> {
    try {
      return await this.connectionProviderLifecycleHookService.runIdentifyAccount(
        { provider, workspaceId, accessToken: apiKey },
      );
    } catch (error) {
      if (
        error instanceof ConnectionProviderException &&
        error.code ===
          ConnectionProviderExceptionCode.IDENTIFY_ACCOUNT_LOGIC_FUNCTION_FAILED
      ) {
        throw new ConnectionProviderException(
          error.message,
          ConnectionProviderExceptionCode.API_KEY_NOT_VERIFIED,
        );
      }

      throw error;
    }
  }
}
