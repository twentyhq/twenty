import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import {
  LogicFunctionTriggerJob,
  type LogicFunctionTriggerJobData,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ConnectionLifecycleHook = 'onConnect' | 'onDisconnect';

type ConnectionLifecycleHookProvider = Pick<
  ConnectionProviderEntity,
  'id' | 'name'
>;

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
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
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
    await this.captureFailures(workspaceId, async () => {
      const logicFunctionId = await this.resolveLogicFunctionId({
        hook: 'onConnect',
        logicFunctionUniversalIdentifier:
          provider.onConnectLogicFunctionUniversalIdentifier,
        provider,
        workspaceId,
      });

      if (!isDefined(logicFunctionId)) {
        return;
      }

      await this.messageQueueService.add<LogicFunctionTriggerJobData>(
        LogicFunctionTriggerJob.name,
        {
          logicFunctionId,
          workspaceId,
          payload: this.buildPayload({ provider, connectedAccountId }),
        },
        {
          retryLimit: 3,
          backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
        },
      );
    });
  }

  // Runs inline, before the connected account and its token are deleted, so the
  // hook can still call the provider to release what onConnect set up remotely.
  async runOnDisconnect({
    connectionProviderId,
    workspaceId,
    connectedAccountId,
  }: {
    connectionProviderId: string;
    workspaceId: string;
    connectedAccountId: string;
  }): Promise<void> {
    await this.captureFailures(workspaceId, async () => {
      const provider =
        await this.connectionProviderService.findOneByIdOrThrow(
          connectionProviderId,
        );
      const logicFunctionId = await this.resolveLogicFunctionId({
        hook: 'onDisconnect',
        logicFunctionUniversalIdentifier:
          provider.onDisconnectLogicFunctionUniversalIdentifier,
        provider,
        workspaceId,
      });

      if (!isDefined(logicFunctionId)) {
        return;
      }

      const executionResult = await this.logicFunctionExecutorService.execute({
        logicFunctionId,
        workspaceId,
        payload: this.buildPayload({ provider, connectedAccountId }),
      });

      if (isDefined(executionResult.error)) {
        throw new ConnectionProviderException(
          `onDisconnect logic function of connection provider ${provider.id} failed: ${executionResult.error.errorMessage}`,
          ConnectionProviderExceptionCode.ON_DISCONNECT_LOGIC_FUNCTION_FAILED,
        );
      }
    });
  }

  // Lifecycle hooks are best effort: a failing hook must never surface to the
  // user connecting or disconnecting their account.
  private async captureFailures(
    workspaceId: string,
    dispatch: () => Promise<void>,
  ): Promise<void> {
    try {
      await dispatch();
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        workspace: { id: workspaceId },
      });
    }
  }

  private buildPayload({
    provider,
    connectedAccountId,
  }: {
    provider: ConnectionLifecycleHookProvider;
    connectedAccountId: string;
  }) {
    return {
      connectionProviderId: provider.id,
      connectionProviderName: provider.name,
      connectedAccountId,
    };
  }

  private async resolveLogicFunctionId({
    hook,
    logicFunctionUniversalIdentifier,
    provider,
    workspaceId,
  }: {
    hook: ConnectionLifecycleHook;
    logicFunctionUniversalIdentifier: string | null;
    provider: ConnectionLifecycleHookProvider;
    workspaceId: string;
  }): Promise<string | undefined> {
    if (!isDefined(logicFunctionUniversalIdentifier)) {
      return undefined;
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

    return flatLogicFunction.id;
  }
}
