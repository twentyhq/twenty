import { promises as fs } from 'fs';
import { dirname, join } from 'path';

import { isNonEmptyString } from '@sniptt/guards';
import { build } from 'esbuild';
import { NODE_ESM_CJS_BANNER } from 'twenty-shared/application';

import {
  type LogicFunctionDriver,
  type LogicFunctionExecuteParams,
  type LogicFunctionExecuteResult,
  type LogicFunctionInstallPrebuiltBundleParams,
  type LogicFunctionTranspileParams,
  type LogicFunctionTranspileResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { LocalChildProcessRunnerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/services/local-child-process-runner.service';
import { LocalLayerManagerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/services/local-layer-manager.service';
import { LocalPrebuiltBundleService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/services/local-prebuilt-bundle.service';
import { type LocalDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/types/local-driver.type';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { isLogicFunctionReadyForPrebuiltInstall } from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-ready-for-prebuilt-install.util';

export { type LocalDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/types/local-driver.type';

export class LocalDriver implements LogicFunctionDriver {
  private readonly logicFunctionResourceService: LogicFunctionResourceService;
  private readonly layerManager: LocalLayerManagerService;
  private readonly childProcessRunner: LocalChildProcessRunnerService;
  private readonly prebuiltBundle: LocalPrebuiltBundleService;

  constructor(options: LocalDriverOptions) {
    this.logicFunctionResourceService = options.logicFunctionResourceService;
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

  async transpile({
    sourceCode,
    sourceFileName,
    builtFileName,
  }: LogicFunctionTranspileParams): Promise<LogicFunctionTranspileResult> {
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
      });

      const builtCode = await fs.readFile(builtBundleFilePath, 'utf-8');

      return { builtCode };
    } finally {
      await temporaryDirManager.clean();
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
    applicationUniversalIdentifier,
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

    await this.layerManager.ensureDepsLayer({
      flatApplication,
      applicationUniversalIdentifier,
    });
    await this.layerManager.ensureSdkLayer({
      flatApplication,
      applicationUniversalIdentifier,
    });

    const startTime = Date.now();
    const temporaryDirManager = new TemporaryDirManager();

    try {
      const { sourceTemporaryDir } = await temporaryDirManager.init();

      await this.childProcessRunner.assembleNodeModules({
        sourceTemporaryDir,
        flatApplication,
        applicationUniversalIdentifier,
      });

      const inMemoryBuiltHandlerPath =
        executionMode === LogicFunctionExecutionMode.PREBUILT
          ? await this.prebuiltBundle.copyPrebuiltBundleIntoExecutionDir({
              flatLogicFunction,
              sourceTemporaryDir,
            })
          : await this.logicFunctionResourceService.copyBuiltCodeInMemory({
              workspaceId: flatLogicFunction.workspaceId,
              applicationUniversalIdentifier,
              builtHandlerPath: flatLogicFunction.builtHandlerPath,
              inMemoryDestinationPath: sourceTemporaryDir,
            });

      const runnerPath = await this.childProcessRunner.writeBootstrapRunner({
        dir: sourceTemporaryDir,
        builtFileAbsPath: inMemoryBuiltHandlerPath,
        handlerName: flatLogicFunction.handlerName,
      });

      const { ok, result, errorType, error, stack, stdout, stderr } =
        await this.childProcessRunner.runChildWithEnv({
          runnerPath,
          env: env ?? {},
          payload,
          context,
          timeoutMs,
        });

      const logs = isNonEmptyString(stderr)
        ? `${stdout}${new Date().toISOString()} ERROR ${stderr}`
        : stdout;

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
}
