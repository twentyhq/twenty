import {
  InvokeCommand,
  type InvokeCommandInput,
  LogType,
  ResourceNotFoundException,
} from '@aws-sdk/client-lambda';
import { Logger } from '@nestjs/common';

import {
  type LogicFunctionDriver,
  type LogicFunctionExecuteParams,
  type LogicFunctionExecuteResult,
  type LogicFunctionInstallPrebuiltBundleParams,
  type LogicFunctionTranspileParams,
  type LogicFunctionTranspileResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import {
  type LambdaDriverExecutorPayload,
  type LambdaDriverOptions,
  LambdaExecutionPhase,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import { LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaExecutorManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-executor-manager.service';
import { LambdaLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-layer-manager.service';
import { LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { parseLambdaLogResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/parse-lambda-log-result.util';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { isLogicFunctionReadyForPrebuiltInstall } from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-ready-for-prebuilt-install.util';

export {
  type LambdaDriverOptions,
  type BuilderLambdaPayload,
  type BuilderLambdaResult,
  type YarnInstallLambdaPayload,
  type YarnInstallLambdaResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';

export class LambdaDriver implements LogicFunctionDriver {
  private readonly logger = new Logger(LambdaDriver.name);

  private readonly awsClient: LambdaAwsClientService;
  private readonly toolFunctions: LambdaToolFunctionsService;
  private readonly layerManager: LambdaLayerManagerService;
  private readonly executorManager: LambdaExecutorManagerService;
  private readonly logicFunctionResourceService: LogicFunctionResourceService;

  constructor(options: LambdaDriverOptions) {
    this.logicFunctionResourceService = options.logicFunctionResourceService;
    this.awsClient = new LambdaAwsClientService(options);
    this.toolFunctions = new LambdaToolFunctionsService(
      options,
      this.awsClient,
    );
    this.layerManager = new LambdaLayerManagerService(
      options,
      this.awsClient,
      this.toolFunctions,
      options.logicFunctionResourceService,
      options.sdkClientArchiveService,
    );
    this.executorManager = new LambdaExecutorManagerService(
      options,
      this.awsClient,
      this.layerManager,
      options.cacheLockService,
      options.logicFunctionResourceService,
      options.workspaceCacheService,
    );
  }

  async transpile({
    sourceCode,
    sourceFileName,
    builtFileName,
  }: LogicFunctionTranspileParams): Promise<LogicFunctionTranspileResult> {
    const { builtCode } = await this.toolFunctions.transpile({
      sourceCode,
      sourceFileName,
      builtFileName,
    });

    return { builtCode };
  }

  async delete(flatLogicFunction: FlatLogicFunction): Promise<void> {
    await this.executorManager.delete(flatLogicFunction);
  }

  async installPrebuiltBundle(
    params: LogicFunctionInstallPrebuiltBundleParams,
  ): Promise<void> {
    await this.executorManager.installPrebuiltBundle(params);
  }

  async getInstalledBundleChecksum(
    flatLogicFunction: FlatLogicFunction,
  ): Promise<string | null> {
    return this.executorManager.getInstalledBundleChecksum(flatLogicFunction);
  }

  async execute({
    flatLogicFunction,
    flatApplication,
    applicationUniversalIdentifier,
    payload,
    env,
    timeoutMs = 900_000,
    forceExecutionMode,
  }: LogicFunctionExecuteParams): Promise<LogicFunctionExecuteResult> {
    const executionMode = forceExecutionMode ?? flatLogicFunction.executionMode;

    if (
      executionMode === LogicFunctionExecutionMode.PREBUILT &&
      !isLogicFunctionReadyForPrebuiltInstall(flatLogicFunction)
    ) {
      throw new LogicFunctionException(
        `Cannot run logic function '${flatLogicFunction.id}' in PREBUILT mode: bundle is not installed`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_PREBUILT_BUNDLE_NOT_INSTALLED,
      );
    }

    let currentPhase: LambdaExecutionPhase = LambdaExecutionPhase.BUILD;
    let buildExecutorMs = 0;
    let getBuiltCodeMs = 0;

    try {
      const buildStart = Date.now();

      await this.executorManager.buildExecutor({
        flatLogicFunction,
        flatApplication,
        applicationUniversalIdentifier,
      });
      buildExecutorMs = Date.now() - buildStart;

      currentPhase = LambdaExecutionPhase.FETCH_CODE;
      const invokeFlowStart = Date.now();

      const executorPayload: LambdaDriverExecutorPayload = {
        params: payload,
        env: env ?? {},
        handlerName: flatLogicFunction.handlerName,
      };

      if (executionMode === LogicFunctionExecutionMode.LIVE) {
        const fetchStart = Date.now();

        executorPayload.code =
          await this.logicFunctionResourceService.getBuiltCode({
            workspaceId: flatLogicFunction.workspaceId,
            applicationUniversalIdentifier,
            builtHandlerPath: flatLogicFunction.builtHandlerPath,
          });
        getBuiltCodeMs = Date.now() - fetchStart;
      }

      currentPhase = LambdaExecutionPhase.INVOKE;

      const payloadString = JSON.stringify(executorPayload);
      const params: InvokeCommandInput = {
        FunctionName: flatLogicFunction.id,
        Payload: payloadString,
        LogType: LogType.Tail,
      };

      const command = new InvokeCommand(params);
      const lambdaClient = await this.awsClient.getLambdaClient();

      const invokeStart = Date.now();
      const result = await lambdaClient.send(command, {
        abortSignal: AbortSignal.timeout(timeoutMs),
      });
      const invokeSendMs = Date.now() - invokeStart;

      const parsedResult = result.Payload
        ? JSON.parse(result.Payload.transformToString())
        : {};

      const {
        logs,
        initDurationMs,
        billedDurationMs,
        reportDurationMs,
        coldStart,
      } = parseLambdaLogResult(result.LogResult);

      const duration = Date.now() - invokeFlowStart;

      this.logger.log(
        `[lambda-timing] fnId=${flatLogicFunction.id} executionMode=${executionMode} totalMs=${Date.now() - buildStart} buildExecutorMs=${buildExecutorMs} getBuiltCodeMs=${getBuiltCodeMs} payloadBytes=${Buffer.byteLength(payloadString, 'utf8')} invokeSendMs=${invokeSendMs} reportDurationMs=${reportDurationMs ?? 'n/a'} billedMs=${billedDurationMs ?? 'n/a'} initDurationMs=${initDurationMs ?? 'n/a'} coldStart=${coldStart}`,
      );

      if (result.FunctionError) {
        return {
          data: null,
          duration,
          status: LogicFunctionExecutionStatus.ERROR,
          error: parsedResult,
          logs,
        };
      }

      return {
        data: parsedResult,
        logs,
        duration,
        status: LogicFunctionExecutionStatus.SUCCESS,
      };
    } catch (error) {
      const phaseTiming = `phase=${currentPhase} buildMs=${buildExecutorMs} fetchCodeMs=${getBuiltCodeMs}`;

      this.logger.error(
        `Lambda invocation failed for function ${flatLogicFunction.id} [${phaseTiming}]: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof ResourceNotFoundException) {
        throw new LogicFunctionException(
          `Function '${flatLogicFunction.id}' does not exist`,
          LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
        );
      }

      if (error instanceof Error && error.name === 'TimeoutError') {
        const executor = await this.executorManager
          .getLambdaExecutor(flatLogicFunction)
          .catch(() => undefined);
        const functionState = executor?.Configuration?.State ?? 'unknown';

        throw new LogicFunctionException(
          `Lambda timed out for function '${flatLogicFunction.id}' during ${currentPhase} (functionState=${functionState}, ${phaseTiming})`,
          LogicFunctionExceptionCode.LOGIC_FUNCTION_EXECUTION_TIMEOUT,
        );
      }

      if (error instanceof LogicFunctionException) {
        throw error;
      }

      throw new LogicFunctionException(
        `Lambda invocation failed for function '${flatLogicFunction.id}' during ${currentPhase}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_EXECUTION_FAILED,
      );
    }
  }
}
