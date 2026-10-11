import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type ConnectionAccountIdentity } from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ConnectionProviderIdentityService {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async identifyAccount({
    provider,
    workspaceId,
    accessToken,
    scopes,
  }: {
    provider: ConnectionProviderEntity;
    workspaceId: string;
    accessToken: PlaintextString;
    scopes: string[];
  }): Promise<ConnectionAccountIdentity | null> {
    const identifier = provider.identifyAccountLogicFunctionUniversalIdentifier;

    if (!isDefined(identifier)) {
      return null;
    }

    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);
    const logicFunction =
      flatLogicFunctionMaps.byUniversalIdentifier[identifier];

    if (
      !isDefined(logicFunction) ||
      isDefined(logicFunction.deletedAt) ||
      logicFunction.applicationId !== provider.applicationId ||
      provider.workspaceId !== workspaceId
    ) {
      throw this.identificationFailed(provider.id);
    }

    try {
      const result = await this.logicFunctionExecutorService.execute({
        logicFunctionId: logicFunction.id,
        workspaceId,
        payload: {
          connectionProviderId: provider.id,
          connectionProviderName: provider.name,
          accessToken,
          scopes,
        },
        shouldEnforceUsageLimits: false,
        timeoutMs: 10_000,
      });

      const identity = result.data;

      if (
        isDefined(result.error) ||
        !isPlainObject(identity) ||
        !isNonEmptyString(identity.externalAccountId) ||
        identity.externalAccountId.trim().length === 0 ||
        identity.externalAccountId.includes('\0') ||
        identity.externalAccountId.length > 512 ||
        (isDefined(identity.handle) &&
          (!isNonEmptyString(identity.handle) ||
            identity.handle.trim().length === 0 ||
            identity.handle.includes('\0') ||
            identity.handle.length > 320))
      ) {
        throw this.identificationFailed(provider.id);
      }

      return {
        externalAccountId: identity.externalAccountId,
        ...(isDefined(identity.handle) ? { handle: identity.handle } : {}),
      };
    } catch {
      // A provider error may contain the credential passed to its hook.
      throw this.identificationFailed(provider.id);
    }
  }

  private identificationFailed(
    providerId: string,
  ): ConnectionProviderException {
    return new ConnectionProviderException(
      `Account identification failed for connection provider ${providerId}`,
      ConnectionProviderExceptionCode.ACCOUNT_IDENTIFICATION_FAILED,
    );
  }
}
