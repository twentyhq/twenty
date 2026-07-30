import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ConnectionLifecycleHook = 'onConnect' | 'onDisconnect';

const MISSING_LOGIC_FUNCTION_EXCEPTION_CODE_BY_HOOK: Record<
  ConnectionLifecycleHook,
  ConnectionProviderExceptionCode
> = {
  onConnect:
    ConnectionProviderExceptionCode.ON_CONNECT_LOGIC_FUNCTION_NOT_FOUND,
  onDisconnect:
    ConnectionProviderExceptionCode.ON_DISCONNECT_LOGIC_FUNCTION_NOT_FOUND,
};

@Injectable()
export class ConnectionProviderLifecycleHookService {
  constructor(
    private readonly connectionProviderService: ConnectionProviderService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async dispatchOnConnect({
    provider,
    workspaceId,
    connectedAccountId,
  }: {
    provider: Pick<
      ConnectionProviderEntity,
      'id' | 'name' | 'onConnectLogicFunctionUniversalIdentifier'
    >;
    workspaceId: string;
    connectedAccountId: string;
  }): Promise<void> {
    try {
      await this.dispatchOrThrow({
        hook: 'onConnect',
        logicFunctionUniversalIdentifier:
          provider.onConnectLogicFunctionUniversalIdentifier,
        provider,
        workspaceId,
        connectedAccountId,
      });
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });
    }
  }

  async dispatchOnDisconnect({
    connectionProviderId,
    workspaceId,
    connectedAccountId,
  }: {
    connectionProviderId: string;
    workspaceId: string;
    connectedAccountId: string;
  }): Promise<void> {
    try {
      const provider =
        await this.connectionProviderService.findOneByIdOrThrow(
          connectionProviderId,
        );

      await this.dispatchOrThrow({
        hook: 'onDisconnect',
        logicFunctionUniversalIdentifier:
          provider.onDisconnectLogicFunctionUniversalIdentifier,
        provider,
        workspaceId,
        connectedAccountId,
      });
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });
    }
  }

  private async dispatchOrThrow({
    hook,
    logicFunctionUniversalIdentifier,
    provider,
    workspaceId,
    connectedAccountId,
  }: {
    hook: ConnectionLifecycleHook;
    logicFunctionUniversalIdentifier: string | null;
    provider: Pick<ConnectionProviderEntity, 'id' | 'name'>;
    workspaceId: string;
    connectedAccountId: string;
  }): Promise<void> {
    if (!isDefined(logicFunctionUniversalIdentifier)) {
      return;
    }

    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

    const flatLogicFunction =
      flatLogicFunctionMaps.byUniversalIdentifier[
        logicFunctionUniversalIdentifier
      ];

    if (
      !isDefined(flatLogicFunction) ||
      isDefined(flatLogicFunction.deletedAt)
    ) {
      throw new ConnectionProviderException(
        `Connection provider ${provider.id} references ${hook} logic function ${logicFunctionUniversalIdentifier}, which was not found in workspace ${workspaceId}.`,
        MISSING_LOGIC_FUNCTION_EXCEPTION_CODE_BY_HOOK[hook],
      );
    }

    await this.messageQueueService.add<LogicFunctionTriggerJobData>(
      LogicFunctionTriggerJob.name,
      {
        logicFunctionId: flatLogicFunction.id,
        workspaceId,
        payload: {
          connectionProviderId: provider.id,
          connectionProviderName: provider.name,
          connectedAccountId,
        },
      },
      { retryLimit: 3 },
    );
  }
}
