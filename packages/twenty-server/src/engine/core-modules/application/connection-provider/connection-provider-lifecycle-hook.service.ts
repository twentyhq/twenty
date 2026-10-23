import { Injectable } from '@nestjs/common';

import {
  type AuthorizeConnectionPayload,
  type ConnectionCallbackPayload,
  type IdentifiedAccount,
  type IdentifyAccountPayload,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { type CustomConnectionProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-custom-provider.util';
import { parseAuthorizeConnectionResult } from 'src/engine/core-modules/application/connection-provider/utils/parse-authorize-connection-result.util';
import {
  parseConnectionCallbackResult,
  type ParsedConnectedAccountFromCallback,
} from 'src/engine/core-modules/application/connection-provider/utils/parse-connection-callback-result.util';
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

type ConnectionLifecycleHook =
  | 'identifyAccount'
  | 'authorize'
  | 'callback'
  | 'onConnect'
  | 'onDisconnect';

type ConnectionFlowHook = Extract<
  ConnectionLifecycleHook,
  'identifyAccount' | 'authorize' | 'callback'
>;

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
  authorize: ConnectionProviderExceptionCode.AUTHORIZE_LOGIC_FUNCTION_NOT_FOUND,
  callback: ConnectionProviderExceptionCode.CALLBACK_LOGIC_FUNCTION_NOT_FOUND,
  onConnect:
    ConnectionProviderExceptionCode.ON_CONNECT_LOGIC_FUNCTION_NOT_FOUND,
  onDisconnect:
    ConnectionProviderExceptionCode.ON_DISCONNECT_LOGIC_FUNCTION_NOT_FOUND,
};

const FAILED_LOGIC_FUNCTION_EXCEPTION_CODE_BY_CONNECTION_FLOW_HOOK: Record<
  ConnectionFlowHook,
  ConnectionProviderExceptionCode
> = {
  identifyAccount:
    ConnectionProviderExceptionCode.IDENTIFY_ACCOUNT_LOGIC_FUNCTION_FAILED,
  authorize: ConnectionProviderExceptionCode.AUTHORIZE_LOGIC_FUNCTION_FAILED,
  callback: ConnectionProviderExceptionCode.CALLBACK_LOGIC_FUNCTION_FAILED,
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

    const data = await this.executeConnectionFlowHook({
      hook: 'identifyAccount',
      provider,
      logicFunctionId,
      workspaceId,
      payload,
    });

    const parsedResult = parseIdentifyAccountResult(data);

    if (!parsedResult.isValid) {
      throw new ConnectionProviderException(
        `identifyAccount logic function of connection provider ${provider.id} returned an invalid result: ${parsedResult.reason}`,
        ConnectionProviderExceptionCode.IDENTIFY_ACCOUNT_LOGIC_FUNCTION_FAILED,
      );
    }

    return parsedResult.identifiedAccount;
  }

  async runAuthorize({
    provider,
    workspaceId,
    callbackUrl,
  }: {
    provider: Pick<
      CustomConnectionProvider,
      'id' | 'name' | 'applicationId' | 'customConfig'
    >;
    workspaceId: string;
    callbackUrl: string;
  }): Promise<string> {
    const logicFunctionId = await this.resolveLogicFunctionIdOrThrow({
      hook: 'authorize',
      logicFunctionUniversalIdentifier:
        provider.customConfig.authorizeLogicFunctionUniversalIdentifier,
      provider,
      workspaceId,
    });

    const payload: AuthorizeConnectionPayload = {
      connectionProviderId: provider.id,
      connectionProviderName: provider.name,
      callbackUrl,
    };

    const data = await this.executeConnectionFlowHook({
      hook: 'authorize',
      provider,
      logicFunctionId,
      workspaceId,
      payload,
    });

    const parsedResult = parseAuthorizeConnectionResult(data);

    if (!parsedResult.isValid) {
      throw new ConnectionProviderException(
        `authorize logic function of connection provider ${provider.id} returned an invalid result: ${parsedResult.reason}`,
        ConnectionProviderExceptionCode.AUTHORIZE_LOGIC_FUNCTION_FAILED,
      );
    }

    return parsedResult.authorizationUrl;
  }

  // failures propagate so nothing is saved from a request the app could not read
  async runCallback({
    provider,
    workspaceId,
    request,
  }: {
    provider: Pick<
      CustomConnectionProvider,
      'id' | 'name' | 'applicationId' | 'customConfig'
    >;
    workspaceId: string;
    request: Pick<
      ConnectionCallbackPayload,
      'httpMethod' | 'queryStringParameters' | 'body'
    >;
  }): Promise<ParsedConnectedAccountFromCallback | null> {
    const logicFunctionId = await this.resolveLogicFunctionIdOrThrow({
      hook: 'callback',
      logicFunctionUniversalIdentifier:
        provider.customConfig.callbackLogicFunctionUniversalIdentifier,
      provider,
      workspaceId,
    });

    const payload: ConnectionCallbackPayload = {
      connectionProviderId: provider.id,
      connectionProviderName: provider.name,
      ...request,
    };

    const data = await this.executeConnectionFlowHook({
      hook: 'callback',
      provider,
      logicFunctionId,
      workspaceId,
      payload,
    });

    const parsedResult = parseConnectionCallbackResult(data);

    if (!parsedResult.isValid) {
      throw new ConnectionProviderException(
        `callback logic function of connection provider ${provider.id} returned an invalid result: ${parsedResult.reason}`,
        ConnectionProviderExceptionCode.CALLBACK_LOGIC_FUNCTION_FAILED,
      );
    }

    return parsedResult.connectedAccount;
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

  private async executeConnectionFlowHook({
    hook,
    provider,
    logicFunctionId,
    workspaceId,
    payload,
  }: {
    hook: ConnectionFlowHook;
    provider: ConnectionLifecycleHookProvider;
    logicFunctionId: string;
    workspaceId: string;
    payload:
      | IdentifyAccountPayload
      | AuthorizeConnectionPayload
      | ConnectionCallbackPayload;
  }): Promise<LogicFunctionExecuteResult['data']> {
    const failureCode =
      FAILED_LOGIC_FUNCTION_EXCEPTION_CODE_BY_CONNECTION_FLOW_HOOK[hook];

    let executionResult: LogicFunctionExecuteResult;

    try {
      executionResult = await this.logicFunctionExecutorService.execute({
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
        `${hook} logic function of connection provider ${provider.id} could not be executed: ${error instanceof Error ? error.message : String(error)}`,
        failureCode,
      );
    }

    if (isDefined(executionResult.error)) {
      throw new ConnectionProviderException(
        `${hook} logic function of connection provider ${provider.id} failed: ${executionResult.error.errorMessage}`,
        failureCode,
      );
    }

    return executionResult.data;
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
    logicFunctionUniversalIdentifier,
    ...args
  }: {
    hook: ConnectionLifecycleHook;
    logicFunctionUniversalIdentifier: string | null;
    provider: ConnectionLifecycleHookProvider;
    workspaceId: string;
  }): Promise<string | undefined> {
    if (!isDefined(logicFunctionUniversalIdentifier)) {
      return undefined;
    }

    return this.resolveLogicFunctionIdOrThrow({
      ...args,
      logicFunctionUniversalIdentifier,
    });
  }

  private async resolveLogicFunctionIdOrThrow({
    hook,
    logicFunctionUniversalIdentifier,
    provider,
    workspaceId,
  }: {
    hook: ConnectionLifecycleHook;
    logicFunctionUniversalIdentifier: string;
    provider: ConnectionLifecycleHookProvider;
    workspaceId: string;
  }): Promise<string> {
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
