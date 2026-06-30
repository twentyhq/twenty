import { promises as fs } from 'fs';
import { dirname, join } from 'path';

import { isNonEmptyString } from '@sniptt/guards';

import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  PREBUILT_BUNDLE_FILE_NAME,
  PREBUILT_INSTALL_LOCK_MAX_RETRIES,
  PREBUILT_INSTALL_LOCK_RETRY_MS,
  PREBUILT_INSTALL_LOCK_TTL_MS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/constants/local-driver.constant';
import {
  getLocalInstalledBundlePath,
  getLocalInstalledChecksumPath,
  getLocalPrebuiltBundleDir,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-prebuilt-bundle-paths.util';
import { type LogicFunctionInstallPrebuiltBundleParams } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export class LocalPrebuiltBundleService {
  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
  ) {}

  async installPrebuiltBundle({
    flatLogicFunction,
    applicationUniversalIdentifier,
  }: LogicFunctionInstallPrebuiltBundleParams): Promise<void> {
    if (!isNonEmptyString(flatLogicFunction.checksum)) {
      throw new LogicFunctionException(
        `Cannot install prebuilt bundle for function '${flatLogicFunction.id}' without a checksum`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_PREBUILT_BUNDLE_NOT_INSTALLED,
      );
    }

    const checksum = flatLogicFunction.checksum;

    await this.cacheLockService.withLock(
      async () => {
        const prebuiltDir = getLocalPrebuiltBundleDir(flatLogicFunction);

        await fs.mkdir(prebuiltDir, { recursive: true });

        await this.logicFunctionResourceService.copyBuiltCodeInMemory({
          workspaceId: flatLogicFunction.workspaceId,
          applicationUniversalIdentifier,
          builtHandlerPath: flatLogicFunction.builtHandlerPath,
          inMemoryDestinationPath: prebuiltDir,
        });

        const downloadedPath = join(
          prebuiltDir,
          flatLogicFunction.builtHandlerPath,
        );
        const targetPath = getLocalInstalledBundlePath(flatLogicFunction);

        if (downloadedPath !== targetPath) {
          await fs.mkdir(dirname(targetPath), { recursive: true });
          await fs.rename(downloadedPath, targetPath);
        }

        await fs.writeFile(
          getLocalInstalledChecksumPath(flatLogicFunction),
          checksum,
          'utf8',
        );
      },
      `local-install:${flatLogicFunction.id}`,
      {
        ttl: PREBUILT_INSTALL_LOCK_TTL_MS,
        ms: PREBUILT_INSTALL_LOCK_RETRY_MS,
        maxRetries: PREBUILT_INSTALL_LOCK_MAX_RETRIES,
      },
    );
  }

  async getInstalledBundleChecksum(
    flatLogicFunction: FlatLogicFunction,
  ): Promise<string | null> {
    try {
      const checksum = await fs.readFile(
        getLocalInstalledChecksumPath(flatLogicFunction),
        'utf8',
      );

      return checksum.trim() || null;
    } catch {
      return null;
    }
  }

  async copyPrebuiltBundleIntoExecutionDir({
    flatLogicFunction,
    sourceTemporaryDir,
  }: {
    flatLogicFunction: FlatLogicFunction;
    sourceTemporaryDir: string;
  }): Promise<string> {
    const installedBundlePath = getLocalInstalledBundlePath(flatLogicFunction);
    const localBundlePath = join(sourceTemporaryDir, PREBUILT_BUNDLE_FILE_NAME);

    await fs.copyFile(installedBundlePath, localBundlePath);

    return localBundlePath;
  }
}
