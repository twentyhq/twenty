import { FRONT_COMPONENT_BUILDER_MAX_PAYLOAD_BYTES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-builder-max-payload-bytes.constant';
import {
  CreateFunctionCommand,
  type CreateFunctionCommandInput,
  InvokeCommand,
  type InvokeCommandOutput,
  LogType,
  PublishLayerVersionCommand,
  UpdateFunctionConfigurationCommand,
} from '@aws-sdk/client-lambda';
import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import * as fs from 'fs/promises';
import { join } from 'path';
import { setTimeout } from 'timers/promises';
import { isDefined } from 'twenty-shared/utils';

import { YARN_ENGINE_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { COMMON_LAYER_DEPENDENCIES_DIRNAME } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/common-layer-dependencies-dirname';
import {
  BUILD_LOCK_MAX_RETRIES,
  BUILD_LOCK_RETRY_MS,
  BUILD_LOCK_TTL_MS,
  BUILDER_FUNCTION_NAME_PREFIX,
  BUILDER_HANDLER_PATH,
  BUILDER_LAMBDA_MEMORY_MB,
  BUILDER_LAMBDA_TIMEOUT_SECONDS,
  COMMON_LAYER_NAME_PREFIX,
  HTTP_EGRESS_FUNCTION_NAME_PREFIX,
  HTTP_EGRESS_LAMBDA_INVOKE_OVERHEAD_MS,
  HTTP_EGRESS_LAMBDA_MAX_INVOKE_ATTEMPTS,
  HTTP_EGRESS_LAMBDA_MAX_INVOKE_PAYLOAD_BYTES,
  HTTP_EGRESS_LAMBDA_MAX_PAYLOAD_SIZE_BYTES,
  HTTP_EGRESS_LAMBDA_MEMORY_MB,
  HTTP_EGRESS_LAMBDA_RATE_LIMIT_RETRY_DELAY_MS,
  HTTP_EGRESS_LAMBDA_TIMEOUT_SECONDS,
  LAMBDA_EPHEMERAL_STORAGE_MB,
  YARN_INSTALL_FUNCTION_NAME_PREFIX,
  YARN_INSTALL_HANDLER_PATH,
  YARN_INSTALL_LAMBDA_MEMORY_MB,
  YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import {
  type BuilderLambdaPayload,
  type BuilderLambdaResult,
  type LambdaDriverOptions,
  type YarnInstallLambdaPayload,
  type YarnInstallLambdaResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import { buildHttpEgressHandlerBundle } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-http-egress-handler-bundle.util';
import { buildHttpEgressRequestTooLargeResponse } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-http-egress-request-too-large-response.util';
import { buildHttpEgressUnavailableResponse } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-http-egress-unavailable-response.util';
import { buildYarnInstallFailureException } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-yarn-install-failure-exception.util';
import { computeHashedLambdaResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/compute-hashed-lambda-resource-name.util';
import {
  type LogicFunctionTranspileParams,
  type LogicFunctionTranspileResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import {
  type BrowserTranspileParams,
  type BrowserTranspileResult,
  type BrowserDependenciesBuildParams,
  type TranspileParams,
  type TranspileResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/types/transpile.type';
import { copyBuilder } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-builder';
import { copyCommonLayerDependencies } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-common-layer-dependencies';
import { copyYarnInstall } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-yarn-install';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';
import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';
import { frontComponentBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-result.schema';
import { frontComponentDependenciesBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-dependencies-build-result.schema';
import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';
import { copyFrontComponentBuilder } from 'src/engine/metadata-modules/ai/ai-front-component/utils/copy-front-component-builder.util';
import { getFrontComponentBuilderName } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-builder-name.util';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export class LambdaToolFunctionsService {
  private commonLayerName: string | undefined;
  private yarnInstallFunctionName: string | undefined;
  private builderFunctionName: string | undefined;
  private httpEgressFunction:
    | { functionName: string; handlerCode: string }
    | undefined;

  constructor(
    private readonly options: Pick<
      LambdaDriverOptions,
      'lambdaRole' | 'resourceNamespace' | 'resourceTags'
    >,
    private readonly awsClient: LambdaAwsClientService,
    private readonly cacheLockService: CacheLockService,
    // Retrying an invoke that may already have run would send a user's request twice.
    private readonly httpEgressAwsClient: LambdaAwsClientService,
  ) {}

  async transpile(
    params: LogicFunctionTranspileParams,
  ): Promise<LogicFunctionTranspileResult>;
  async transpile(
    params: BrowserTranspileParams,
  ): Promise<BrowserTranspileResult>;
  async transpile(params: TranspileParams): Promise<TranspileResult>;
  async transpile(params: TranspileParams): Promise<TranspileResult> {
    if (params.targetRuntime === 'browser') {
      const { targetRuntime: _targetRuntime, ...request } = params;
      return frontComponentBuildResultSchema.parse(
        await this.invokeBrowserBuilder({ ...request, action: 'transpile' }),
      );
    }
    await this.ensureBuilderLambdaExists();

    const lambdaClient = await this.awsClient.getLambdaClient();
    const builderFunctionName = await this.getBuilderFunctionName();

    const payload: BuilderLambdaPayload = {
      action: 'transpile',
      ...params,
    };

    const result = await lambdaClient
      .send(
        new InvokeCommand({
          FunctionName: builderFunctionName,
          Payload: JSON.stringify(payload),
          LogType: LogType.Tail,
        }),
        {
          abortSignal: AbortSignal.timeout(
            BUILDER_LAMBDA_TIMEOUT_SECONDS * 1000,
          ),
        },
      )
      .catch(async (error) => {
        await this.awsClient.clearFunctionCache(builderFunctionName);

        throw error;
      });

    if (result.FunctionError) {
      const parsedResult = result.Payload
        ? JSON.parse(result.Payload.transformToString())
        : {};

      const userCompilationErrorRegex = /^Build failed with \d+ error/;

      const isUserCompilationError =
        isNonEmptyString(parsedResult?.errorMessage) &&
        userCompilationErrorRegex.test(parsedResult.errorMessage);

      if (isUserCompilationError) {
        throw new LogicFunctionException(
          `Function code compilation failed: ${parsedResult.errorMessage}`,
          LogicFunctionExceptionCode.LOGIC_FUNCTION_COMPILATION_FAILED,
        );
      }

      throw new LogicFunctionException(
        `Builder Lambda failed: ${JSON.stringify(parsedResult)}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_CREATE_FAILED,
      );
    }

    const parsedResult: BuilderLambdaResult = result.Payload
      ? JSON.parse(result.Payload.transformToString())
      : {};

    if (!parsedResult.builtCode) {
      throw new Error('Builder Lambda did not return builtCode');
    }

    return { builtCode: parsedResult.builtCode };
  }

  async buildDependencies({
    targetRuntime: _targetRuntime,
    ...request
  }: BrowserDependenciesBuildParams) {
    return frontComponentDependenciesBuildResultSchema.parse(
      await this.invokeBrowserBuilder({
        ...request,
        action: 'buildDependencies',
      }),
    );
  }

  private async invokeBrowserBuilder({
    workspaceId,
    ...input
  }: FrontComponentBuilderRequest & { workspaceId: string }): Promise<unknown> {
    const payload = JSON.stringify(input);
    if (
      Buffer.byteLength(payload) > FRONT_COMPONENT_BUILDER_MAX_PAYLOAD_BYTES
    ) {
      throw new FrontComponentException(
        'Frontend component builder request exceeds the 6 MiB limit. Reduce the app dependencies or generated SDK size.',
        FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
        {
          userFriendlyMessage: msg`Frontend component builder request exceeds the 6 MiB limit. Reduce the app dependencies or generated SDK size.`,
        },
      );
    }
    const isDependenciesBuild = input.action === 'buildDependencies';
    const functionName = await getFrontComponentBuilderName({
      workspaceId,
      namespace: this.options.resourceNamespace,
      action: input.action,
    });
    const timeoutSeconds = isDependenciesBuild
      ? YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS
      : BUILDER_LAMBDA_TIMEOUT_SECONDS;
    await this.ensureBuildToolLambdaIsActive({
      functionName,
      memoryMb: isDependenciesBuild
        ? YARN_INSTALL_LAMBDA_MEMORY_MB
        : BUILDER_LAMBDA_MEMORY_MB,
      timeoutSeconds,
      copyFiles: async (directory) => {
        await copyFrontComponentBuilder(directory);
        if (isDependenciesBuild) {
          await fs.cp(YARN_ENGINE_DIRNAME, join(directory, 'yarn-engine'), {
            recursive: true,
          });
        }
      },
    });
    const lambdaClient = await this.awsClient.getLambdaClient();
    const result = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: functionName,
        Payload: payload,
      }),
      { abortSignal: AbortSignal.timeout(timeoutSeconds * 1000) },
    );
    if (result.FunctionError || !isDefined(result.Payload)) {
      throw new FrontComponentException(
        'Frontend component builder Lambda failed.',
        FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
      );
    }
    return JSON.parse(result.Payload.transformToString());
  }

  async executeHttpRequest(
    request: HttpEgressRequest,
  ): Promise<HttpEgressResponse> {
    const startedAt = Date.now();
    const lambdaRequest: HttpEgressRequest = {
      ...request,
      limits: {
        ...request.limits,
        maxPayloadSizeBytes: Math.min(
          request.limits.maxPayloadSizeBytes,
          HTTP_EGRESS_LAMBDA_MAX_PAYLOAD_SIZE_BYTES,
        ),
      },
    };

    const payload = JSON.stringify(lambdaRequest);

    if (
      Buffer.byteLength(payload) > HTTP_EGRESS_LAMBDA_MAX_INVOKE_PAYLOAD_BYTES
    ) {
      return buildHttpEgressRequestTooLargeResponse(startedAt);
    }

    let functionName: string | undefined;
    let result: InvokeCommandOutput;

    try {
      functionName = await this.ensureHttpEgressLambdaIsActive();
      result = await this.invokeHttpEgressLambda({
        functionName,
        payload,
        abortSignal: AbortSignal.timeout(
          request.limits.timeoutMs + HTTP_EGRESS_LAMBDA_INVOKE_OVERHEAD_MS,
        ),
      });
    } catch (error) {
      if (isDefined(functionName)) {
        await this.awsClient.clearFunctionCache(functionName);
      }

      // A request timeout comes back from the Lambda in time, so the client giving up means the invoke itself stalled.
      return buildHttpEgressUnavailableResponse({
        request,
        startedAt,
        isTimeout: false,
        reason: error instanceof Error ? error.message : String(error),
      });
    }

    const resultPayload = result.Payload?.transformToString();

    if (isDefined(result.FunctionError) || !isNonEmptyString(resultPayload)) {
      return buildHttpEgressUnavailableResponse({
        request,
        startedAt,
        isTimeout: resultPayload?.includes('Task timed out') ?? false,
        reason: resultPayload ?? result.FunctionError,
      });
    }

    return JSON.parse(resultPayload) as HttpEgressResponse;
  }

  private async invokeHttpEgressLambda({
    functionName,
    payload,
    abortSignal,
    attempt = 1,
  }: {
    functionName: string;
    payload: string;
    abortSignal: AbortSignal;
    attempt?: number;
  }): Promise<InvokeCommandOutput> {
    const lambdaClient = await this.httpEgressAwsClient.getLambdaClient();

    try {
      return await lambdaClient.send(
        new InvokeCommand({ FunctionName: functionName, Payload: payload }),
        { abortSignal },
      );
    } catch (error) {
      // A rate-limited invoke never ran, so it is the only failure that can be retried without sending the request twice.
      const isRateLimited =
        error instanceof LogicFunctionException &&
        error.code === LogicFunctionExceptionCode.LOGIC_FUNCTION_RATE_LIMITED;

      if (!isRateLimited || attempt >= HTTP_EGRESS_LAMBDA_MAX_INVOKE_ATTEMPTS) {
        throw error;
      }

      await setTimeout(
        attempt * HTTP_EGRESS_LAMBDA_RATE_LIMIT_RETRY_DELAY_MS,
        undefined,
        { signal: abortSignal },
      );

      return this.invokeHttpEgressLambda({
        functionName,
        payload,
        abortSignal,
        attempt: attempt + 1,
      });
    }
  }

  private async ensureHttpEgressLambdaIsActive(): Promise<string> {
    const { functionName, handlerCode } = await this.getHttpEgressFunction();

    await this.ensureBuildToolLambdaIsActive({
      functionName,
      memoryMb: HTTP_EGRESS_LAMBDA_MEMORY_MB,
      timeoutSeconds: HTTP_EGRESS_LAMBDA_TIMEOUT_SECONDS,
      copyFiles: async (directory) => {
        await fs.writeFile(join(directory, 'index.js'), handlerCode);
      },
      withCommonLayer: false,
    });

    return functionName;
  }

  async runYarnInstallCreateLayer(
    params: Omit<YarnInstallLambdaPayload, 'action'>,
  ): Promise<YarnInstallLambdaResult> {
    await this.ensureYarnInstallLambdaExists();

    const lambdaClient = await this.awsClient.getLambdaClient();

    const yarnInstallFunctionName = await this.getYarnInstallFunctionName();

    const payload: YarnInstallLambdaPayload = {
      action: 'createLayer',
      ...params,
    };

    const result = await lambdaClient
      .send(
        new InvokeCommand({
          FunctionName: yarnInstallFunctionName,
          Payload: JSON.stringify(payload),
          LogType: LogType.Tail,
        }),
        {
          abortSignal: AbortSignal.timeout(
            YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS * 1000,
          ),
        },
      )
      .catch(async (error) => {
        await this.awsClient.clearFunctionCache(yarnInstallFunctionName);

        throw error;
      });

    if (result.FunctionError) {
      const parsedResult = result.Payload
        ? JSON.parse(result.Payload.transformToString())
        : {};

      throw buildYarnInstallFailureException(parsedResult);
    }

    const parsedResult: YarnInstallLambdaResult = result.Payload
      ? JSON.parse(result.Payload.transformToString())
      : {};

    if (!parsedResult.success) {
      throw new Error('Yarn install Lambda did not report success');
    }

    return parsedResult;
  }

  private async ensureCommonLayerExists(): Promise<string> {
    const commonLayerName = await this.getCommonLayerName();
    const existingArn =
      await this.awsClient.getExistingLayerArn(commonLayerName);

    if (isDefined(existingArn)) {
      return existingArn;
    }

    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    try {
      await copyCommonLayerDependencies(sourceTemporaryDir);

      await createZipFile(sourceTemporaryDir, lambdaZipPath);

      const lambdaClient = await this.awsClient.getLambdaClient();

      const result = await lambdaClient.send(
        new PublishLayerVersionCommand({
          LayerName: commonLayerName,
          Content: { ZipFile: await fs.readFile(lambdaZipPath) },
          CompatibleRuntimes: [
            LogicFunctionRuntime.NODE18,
            LogicFunctionRuntime.NODE22,
          ],
        }),
      );

      if (!result.LayerVersionArn) {
        throw new Error(
          'PublishLayerVersion did not return a LayerVersionArn for common layer',
        );
      }

      return result.LayerVersionArn;
    } finally {
      await temporaryDirManager.clean();
    }
  }

  async ensureBuildToolLambdaIsActive({
    functionName,
    memoryMb,
    timeoutSeconds,
    copyFiles,
    withCommonLayer = true,
  }: {
    functionName: string;
    memoryMb: number;
    timeoutSeconds: number;
    copyFiles: (directory: string) => Promise<void>;
    withCommonLayer?: boolean;
  }): Promise<void> {
    const existingFunction = await this.awsClient.getFunction(functionName);

    if (existingFunction?.Configuration?.State === 'Active') {
      return;
    }

    await this.cacheLockService.withLock(
      async () => {
        const existingFunction = await this.awsClient.getFunction(functionName);

        if (isDefined(existingFunction)) {
          if (existingFunction.Configuration?.State === 'Inactive') {
            const lambdaClient = await this.awsClient.getLambdaClient();

            await lambdaClient.send(
              new UpdateFunctionConfigurationCommand({
                FunctionName: functionName,
                MemorySize: memoryMb,
                Timeout: timeoutSeconds,
              }),
            );
          }

          await this.awsClient.waitFunctionActive(functionName);

          return;
        }

        const layers = withCommonLayer
          ? [await this.ensureCommonLayerExists()]
          : [];
        const temporaryDirManager = new TemporaryDirManager();
        const { sourceTemporaryDir, lambdaZipPath } =
          await temporaryDirManager.init();

        try {
          await copyFiles(sourceTemporaryDir);
          await createZipFile(sourceTemporaryDir, lambdaZipPath);

          const lambdaClient = await this.awsClient.getLambdaClient();
          const params: CreateFunctionCommandInput = {
            Code: { ZipFile: await fs.readFile(lambdaZipPath) },
            FunctionName: functionName,
            Layers: layers,
            Handler: 'index.handler',
            Role: this.options.lambdaRole,
            Tags: this.options.resourceTags,
            Runtime: LogicFunctionRuntime.NODE22,
            Timeout: timeoutSeconds,
            MemorySize: memoryMb,
            EphemeralStorage: { Size: LAMBDA_EPHEMERAL_STORAGE_MB },
          };

          await lambdaClient.send(new CreateFunctionCommand(params));
        } finally {
          await temporaryDirManager.clean();
        }

        await this.awsClient.waitFunctionActive(functionName);
      },
      `lambda-tool-build:${functionName}`,
      {
        ttl: BUILD_LOCK_TTL_MS,
        ms: BUILD_LOCK_RETRY_MS,
        maxRetries: BUILD_LOCK_MAX_RETRIES,
      },
    );
  }

  private async ensureYarnInstallLambdaExists(): Promise<void> {
    await this.ensureBuildToolLambdaIsActive({
      functionName: await this.getYarnInstallFunctionName(),
      memoryMb: YARN_INSTALL_LAMBDA_MEMORY_MB,
      timeoutSeconds: YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
      copyFiles: copyYarnInstall,
    });
  }

  private async ensureBuilderLambdaExists(): Promise<void> {
    await this.ensureBuildToolLambdaIsActive({
      functionName: await this.getBuilderFunctionName(),
      memoryMb: BUILDER_LAMBDA_MEMORY_MB,
      timeoutSeconds: BUILDER_LAMBDA_TIMEOUT_SECONDS,
      copyFiles: copyBuilder,
    });
  }

  private async getCommonLayerName(): Promise<string> {
    if (isDefined(this.commonLayerName)) {
      return this.commonLayerName;
    }

    const [packageJson, yarnLock] = await Promise.all([
      fs.readFile(
        join(COMMON_LAYER_DEPENDENCIES_DIRNAME, 'package.json'),
        'utf-8',
      ),
      fs.readFile(
        join(COMMON_LAYER_DEPENDENCIES_DIRNAME, 'yarn.lock'),
        'utf-8',
      ),
    ]);

    this.commonLayerName = computeHashedLambdaResourceName({
      resourceNamePrefix: COMMON_LAYER_NAME_PREFIX,
      namespace: this.options.resourceNamespace,
      contents: [packageJson, yarnLock],
    });

    return this.commonLayerName;
  }

  private async getYarnInstallFunctionName(): Promise<string> {
    if (isDefined(this.yarnInstallFunctionName)) {
      return this.yarnInstallFunctionName;
    }

    const [handlerContent, installerContent] = await Promise.all([
      fs.readFile(YARN_INSTALL_HANDLER_PATH, 'utf-8'),
      fs.readFile(
        join(YARN_ENGINE_DIRNAME, 'install-yarn-dependencies.cjs'),
        'utf-8',
      ),
    ]);

    this.yarnInstallFunctionName = computeHashedLambdaResourceName({
      resourceNamePrefix: YARN_INSTALL_FUNCTION_NAME_PREFIX,
      namespace: this.options.resourceNamespace,
      contents: [
        handlerContent,
        installerContent,
        String(YARN_INSTALL_LAMBDA_MEMORY_MB),
        String(YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS),
        String(LAMBDA_EPHEMERAL_STORAGE_MB),
      ],
    });

    return this.yarnInstallFunctionName;
  }

  private async getHttpEgressFunction(): Promise<{
    functionName: string;
    handlerCode: string;
  }> {
    if (isDefined(this.httpEgressFunction)) {
      return this.httpEgressFunction;
    }

    const handlerCode = await buildHttpEgressHandlerBundle();

    this.httpEgressFunction = {
      handlerCode,
      functionName: computeHashedLambdaResourceName({
        resourceNamePrefix: HTTP_EGRESS_FUNCTION_NAME_PREFIX,
        namespace: this.options.resourceNamespace,
        contents: [
          handlerCode,
          String(HTTP_EGRESS_LAMBDA_MEMORY_MB),
          String(HTTP_EGRESS_LAMBDA_TIMEOUT_SECONDS),
        ],
      }),
    };

    return this.httpEgressFunction;
  }

  private async getBuilderFunctionName(): Promise<string> {
    if (isDefined(this.builderFunctionName)) {
      return this.builderFunctionName;
    }

    const handlerContent = await fs.readFile(BUILDER_HANDLER_PATH, 'utf-8');

    this.builderFunctionName = computeHashedLambdaResourceName({
      resourceNamePrefix: BUILDER_FUNCTION_NAME_PREFIX,
      namespace: this.options.resourceNamespace,
      contents: [
        handlerContent,
        String(BUILDER_LAMBDA_MEMORY_MB),
        String(BUILDER_LAMBDA_TIMEOUT_SECONDS),
        String(LAMBDA_EPHEMERAL_STORAGE_MB),
      ],
    });

    return this.builderFunctionName;
  }
}
