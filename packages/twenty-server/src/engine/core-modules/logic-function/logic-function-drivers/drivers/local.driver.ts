import { build } from 'esbuild';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { NODE_ESM_CJS_BANNER } from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { YARN_ENGINE_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname';
import {
  BUILDER_LAMBDA_TIMEOUT_SECONDS,
  YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { LocalChildProcessRunnerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/services/local-child-process-runner.service';
import { LocalLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/services/local-layer-manager.service';
import { LocalPrebuiltBundleService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/services/local-prebuilt-bundle.service';
import { type LocalDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/types/local-driver.type';
import {
  type LogicFunctionDriver,
  type LogicFunctionExecuteParams,
  type LogicFunctionExecuteResult,
  type LogicFunctionInstallPrebuiltBundleParams,
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
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { frontComponentBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-result.schema';
import { frontComponentDependenciesBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-dependencies-build-result.schema';
import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';
import { copyFrontComponentBuilder } from 'src/engine/metadata-modules/ai/ai-front-component/utils/copy-front-component-builder.util';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { isLogicFunctionReadyForPrebuiltInstall } from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-ready-for-prebuilt-install.util';
import { executeHttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/utils/execute-http-egress-request.util';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';
import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';

export { type LocalDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/types/local-driver.type';

export class LocalDriver implements LogicFunctionDriver {
  private readonly logicFunctionResourceService: LogicFunctionResourceService;
  private readonly layerManager: LocalLayerManagerService;
  private readonly childProcessRunner: LocalChildProcessRunnerService;
  private readonly prebuiltBundle: LocalPrebuiltBundleService;
  private readonly secureHttpClientService: SecureHttpClientService;

  constructor(options: LocalDriverOptions) {
    this.logicFunctionResourceService = options.logicFunctionResourceService;
    this.secureHttpClientService = options.secureHttpClientService;
    this.layerManager = new LocalLayerManagerService(
      options.cacheLockService,
      options.logicFunctionResourceService,
      options.sdkClientArchiveService,
      options.workspaceCacheService,
    );
    this.childProcessRunner = new LocalChildProcessRunnerService();
    this.prebuiltBundle = new LocalPrebuiltBundleService(
      options.cacheLockService,
      options.logicFunctionResourceService,
    );
  }

  async transpile(
    params: LogicFunctionTranspileParams,
  ): Promise<LogicFunctionTranspileResult>;
  async transpile(
    params: BrowserTranspileParams,
  ): Promise<BrowserTranspileResult>;
  async transpile(params: TranspileParams): Promise<TranspileResult>;
  async transpile(params: TranspileParams): Promise<TranspileResult> {
    if (params.targetRuntime === 'browser') {
      const {
        targetRuntime: _targetRuntime,
        workspaceId: _workspaceId,
        ...input
      } = params;
      return frontComponentBuildResultSchema.parse(
        await this.invokeBrowserBuilder({ ...input, action: 'transpile' }),
      );
    }
    const { sourceCode, sourceFileName, builtFileName } = params;
    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir } = await temporaryDirManager.init();

    try {
      const entryFilePath = join(sourceTemporaryDir, sourceFileName);
      const builtBundleFilePath = join(sourceTemporaryDir, builtFileName);

      await fs.mkdir(dirname(entryFilePath), { recursive: true });
      await fs.writeFile(entryFilePath, sourceCode, 'utf-8');
      await fs.mkdir(dirname(builtBundleFilePath), { recursive: true });

      await build({
        entryPoints: [entryFilePath],
        outfile: builtBundleFilePath,
        platform: 'node',
        format: 'esm',
        target: 'esnext',
        bundle: true,
        sourcemap: true,
        packages: 'external',
        banner: NODE_ESM_CJS_BANNER,
      }).catch((error: unknown) => {
        // esbuild reports source diagnostics in `errors`; anything else is not the user's code
        if (
          !(error instanceof Error) ||
          !('errors' in error) ||
          !Array.isArray(error.errors) ||
          !isNonEmptyArray(error.errors)
        ) {
          throw error;
        }

        throw new LogicFunctionException(
          `Function code compilation failed: ${error.message}`,
          LogicFunctionExceptionCode.LOGIC_FUNCTION_COMPILATION_FAILED,
        );
      });

      const builtCode = await fs.readFile(builtBundleFilePath, 'utf-8');

      return { builtCode };
    } finally {
      await temporaryDirManager.clean();
    }
  }

  async buildDependencies({
    targetRuntime: _targetRuntime,
    workspaceId: _workspaceId,
    ...input
  }: BrowserDependenciesBuildParams) {
    return frontComponentDependenciesBuildResultSchema.parse(
      await this.invokeBrowserBuilder({
        ...input,
        action: 'buildDependencies',
      }),
    );
  }

  private async invokeBrowserBuilder(input: FrontComponentBuilderRequest) {
    const directory = await fs.mkdtemp(
      join(tmpdir(), 'front-component-builder-'),
    );
    try {
      await copyFrontComponentBuilder(directory);
      await fs.mkdir(join(directory, 'node_modules'));
      await fs.symlink(
        dirname(require.resolve('esbuild/package.json')),
        join(directory, 'node_modules/esbuild'),
        'junction',
      );
      if (input.action === 'buildDependencies') {
        await fs.cp(YARN_ENGINE_DIRNAME, join(directory, 'yarn-engine'), {
          recursive: true,
        });
      }
      const runnerPath = await this.childProcessRunner.writeBootstrapRunner({
        dir: directory,
        builtFileAbsPath: join(directory, 'index.mjs'),
        handlerName: 'handler',
      });
      const { NODE_OPTIONS: _nodeOptions, ...environment } = process.env;
      const result = await this.childProcessRunner.runChild({
        runnerPath,
        executionDirectory: directory,
        env: {
          ...environment,
          TMPDIR: directory,
          TMP: directory,
          TEMP: directory,
        },
        payload: input,
        timeoutMs:
          (input.action === 'buildDependencies'
            ? YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS
            : BUILDER_LAMBDA_TIMEOUT_SECONDS) * 1000,
        maxOutputLength: 8192,
      });
      if (!result.ok) {
        throw new FrontComponentException(
          `Local frontend component builder failed: ${result.error ?? result.stderr}`,
          FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
        );
      }
      return result.result;
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  }

  async delete(): Promise<void> {}

  async deleteApplicationResources(): Promise<void> {}

  async installPrebuiltBundle(
    params: LogicFunctionInstallPrebuiltBundleParams,
  ): Promise<void> {
    await this.prebuiltBundle.installPrebuiltBundle(params);
  }

  async getInstalledBundleChecksum(
    flatLogicFunction: FlatLogicFunction,
  ): Promise<string | null> {
    return this.prebuiltBundle.getInstalledBundleChecksum(flatLogicFunction);
  }

  async execute({
    flatLogicFunction,
    flatApplication,
    payload,
    context,
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

    await this.layerManager.ensureDepsLayer(flatApplication);
    await this.layerManager.ensureSdkLayer(flatApplication);

    const startTime = Date.now();
    const temporaryDirManager = new TemporaryDirManager();

    try {
      const { sourceTemporaryDir } = await temporaryDirManager.init();

      await this.childProcessRunner.assembleNodeModules({
        sourceTemporaryDir,
        flatApplication,
      });

      const inMemoryBuiltHandlerPath =
        executionMode === LogicFunctionExecutionMode.PREBUILT
          ? await this.prebuiltBundle.copyPrebuiltBundleIntoExecutionDir({
              flatLogicFunction,
              sourceTemporaryDir,
            })
          : await this.logicFunctionResourceService.copyBuiltCodeInMemory({
              workspaceId: flatLogicFunction.workspaceId,
              applicationUniversalIdentifier:
                flatApplication.universalIdentifier,
              builtHandlerPath: flatLogicFunction.builtHandlerPath,
              inMemoryDestinationPath: sourceTemporaryDir,
            });

      let logs = '';

      const runnerPath = await this.childProcessRunner.writeBootstrapRunner({
        dir: sourceTemporaryDir,
        builtFileAbsPath: inMemoryBuiltHandlerPath,
        handlerName: flatLogicFunction.handlerName,
      });

      const { ok, result, errorType, error, stack, stdout, stderr } =
        await this.childProcessRunner.runChildWithEnv({
          runnerPath,
          executionDirectory: sourceTemporaryDir,
          flatApplication,
          env: env ?? {},
          payload,
          context,
          timeoutMs,
        });

      if (stdout) {
        logs +=
          stdout
            .split('\n')
            .filter(Boolean)
            .map((l) => `${new Date().toISOString()} INFO ${l}`)
            .join('\n') + '\n';
      }
      if (stderr) {
        logs +=
          stderr
            .split('\n')
            .filter(Boolean)
            .map((l) => `${new Date().toISOString()} ERROR ${l}`)
            .join('\n') + '\n';
      }

      const duration = Date.now() - startTime;

      if (ok) {
        return {
          data: (result ?? null) as object | null,
          logs,
          duration,
          billedDurationMs: duration,
          status: LogicFunctionExecutionStatus.SUCCESS,
        };
      }

      return {
        data: null,
        logs,
        duration,
        billedDurationMs: duration,
        error: {
          errorType: errorType ?? 'UnhandledError',
          errorMessage: error || 'Unknown error',
          stackTrace: stack ? String(stack).split('\n') : [],
        },
        status: LogicFunctionExecutionStatus.ERROR,
      };
    } finally {
      await temporaryDirManager.clean();
    }
  }

  async executeHttpRequest(
    request: HttpEgressRequest,
  ): Promise<HttpEgressResponse> {
    return executeHttpEgressRequest(
      request,
      this.secureHttpClientService.getHttpClient(),
    );
  }
}
