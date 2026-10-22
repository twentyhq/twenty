import { Injectable } from '@nestjs/common';

import {
  type IdentifiedAccount,
  type IdentifyAccountPayload,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { parseIdentifyAccountResult } from 'src/engine/core-modules/application/connection-provider/utils/parse-identify-account-result.util';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
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
import { CustomException } from 'src/utils/custom-exception';

type ConnectionLifecycleHook = 'identifyAccount' | 'onConnect' | 'onDisconnect';

type ConnectionLifecycleHookProvider = Pick<
  ConnectionProviderEntity,
  'id' | 'name' | 'applicationId'
>;

const MISSING_LOGIC_FUNCTION_EXCEPTION_CODE_BY_HOOK: Record<
  ConnectionLifecycleHook,
  ConnectionProviderExceptionCode
> = {
  identifyAccount:
    ConnectionProviderExceptionCode.IDENTIFY_ACCOUNT_LOGIC_FUNCTION_NOT_FOUND,
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
      | 'id'
      | 'name'
      | 'applicationId'
      | 'onConnectLogicFunctionUniversalIdentifier'
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

  // Unlike the other hooks, failures propagate: an account core could not identify must not be saved.
  async runIdentifyAccount({
    provider,
    workspaceId,
    accessToken,
  }: {
    provider: Pick<
      ConnectionProviderEntity,
      | 'id'
      | 'name'
      | 'applicationId'
      | 'identifyAccountLogicFunctionUniversalIdentifier'
    >;
    workspaceId: string;
    accessToken: string;
  }): Promise<IdentifiedAccount | null> {
    const logicFunctionId = await this.resolveLogicFunctionId({
      hook: 'identifyAccount',
      logicFunctionUniversalIdentifier:
        provider.identifyAccountLogicFunctionUniversalIdentifier,
      provider,
      workspaceId,
    });

    if (!isDefined(logicFunctionId)) {
      return null;
    }

    const payload: IdentifyAccountPayload = {
      connectionProviderId: provider.id,
      connectionProviderName: provider.name,
      accessToken,
    };

    const executionResult = await this.executeIdentifyAccount({
      provider,
      logicFunctionId,
      workspaceId,
      payload,
    });

    if (isDefined(executionResult.error)) {
      throw new ConnectionProviderException(
        `identifyAccount logic function of connection provider ${provider.id} failed: ${executionResult.error.errorMessage}`,
        ConnectionProviderExceptionCode.IDENTIFY_ACCOUNT_LOGIC_FUNCTION_FAILED,
      );
    }

    const parsedResult = parseIdentifyAccountResult(executionResult.data);

    if (!parsedResult.isValid) {
      throw new ConnectionProviderException(
        `identifyAccount logic function of connection provider ${provider.id} returned an invalid result: ${parsedResult.reason}`,
        ConnectionProviderExceptionCode.IDENTIFY_ACCOUNT_LOGIC_FUNCTION_FAILED,
      );
    }

    return parsedResult.identifiedAccount;
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
      const provider = await this.connectionProviderService.findOneByIdOrThrow({
        id: connectionProviderId,
        workspaceId,
      });
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
        shouldEnforceUsageLimits: false,
      });

      if (isDefined(executionResult.error)) {
        throw new ConnectionProviderException(
          `onDisconnect logic function of connection provider ${provider.id} failed: ${executionResult.error.errorMessage}`,
          ConnectionProviderExceptionCode.ON_DISCONNECT_LOGIC_FUNCTION_FAILED,
        );
      }
    });
  }

  private async executeIdentifyAccount({
    provider,
    logicFunctionId,
    workspaceId,
    payload,
  }: {
    provider: ConnectionLifecycleHookProvider;
    logicFunctionId: string;
    workspaceId: string;
    payload: IdentifyAccountPayload;
  }): Promise<LogicFunctionExecuteResult> {
    try {
      return await this.logicFunctionExecutorService.execute({
        logicFunctionId,
        workspaceId,
        payload,
        shouldEnforceUsageLimits: true,
      });
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }

      throw new ConnectionProviderException(
        `identifyAccount logic function of connection provider ${provider.id} could not be executed: ${error instanceof Error ? error.message : String(error)}`,
        ConnectionProviderExceptionCode.IDENTIFY_ACCOUNT_LOGIC_FUNCTION_FAILED,
      );
    }
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
      isDefined(flatLogicFunction.deletedAt) ||
      flatLogicFunction.applicationId !== provider.applicationId
    ) {
      throw new ConnectionProviderException(
        `Connection provider ${provider.id} references ${hook} logic function ${logicFunctionUniversalIdentifier}, which was not found in its application.`,
        MISSING_LOGIC_FUNCTION_EXCEPTION_CODE_BY_HOOK[hook],
      );
    }

    return flatLogicFunction.id;
  }
}
