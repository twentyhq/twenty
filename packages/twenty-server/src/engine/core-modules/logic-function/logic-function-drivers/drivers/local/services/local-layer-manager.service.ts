import { Logger } from '@nestjs/common';

import { promises as fs } from 'fs';
import { join } from 'path';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { copyYarnEngineAndBuildDependencies } from 'src/engine/core-modules/application/application-package/utils/copy-yarn-engine-and-build-dependencies';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  LAYER_BUILD_LOCK_MAX_RETRIES,
  LAYER_BUILD_LOCK_RETRY_MS,
  LAYER_BUILD_LOCK_TTL_MS,
  LAYER_BUILD_READY_SENTINEL,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/constants/local-driver.constant';
import { getLocalDepsLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-deps-layer-path.util';
import { getLocalSdkLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-sdk-layer-path.util';
import { pathExists } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/path-exists.util';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { type SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type LayerAppContext = {
  flatApplication: FlatApplication;
  applicationUniversalIdentifier: string;
};

export class LocalLayerManagerService {
  private readonly logger = new Logger(LocalLayerManagerService.name);

  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
    private readonly sdkClientArchiveService: SdkClientArchiveService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async ensureDepsLayer({
    flatApplication,
    applicationUniversalIdentifier,
  }: LayerAppContext): Promise<void> {
    const depsLayerPath = getLocalDepsLayerPath(flatApplication);
    const depsReadySentinelPath = join(
      depsLayerPath,
      LAYER_BUILD_READY_SENTINEL,
    );

    if (await pathExists(depsReadySentinelPath)) {
      return;
    }

    const lockKey = `local-driver-deps-layer:${flatApplication.yarnLockChecksum ?? 'default'}`;

    await this.cacheLockService.withLock(
      async () => {
        if (await pathExists(depsReadySentinelPath)) {
          return;
        }

        const buildStartedAt = Date.now();

        await fs.rm(depsLayerPath, { recursive: true, force: true });

        await this.logicFunctionResourceService.copyDependenciesInMemory({
          applicationUniversalIdentifier,
          workspaceId: flatApplication.workspaceId,
          inMemoryFolderPath: depsLayerPath,
        });
        await copyYarnEngineAndBuildDependencies(depsLayerPath);
        await fs.writeFile(depsReadySentinelPath, '');

        this.logger.log(
          `Built deps layer for application ${flatApplication.id} in ${Date.now() - buildStartedAt}ms`,
        );
      },
      lockKey,
      {
        ttl: LAYER_BUILD_LOCK_TTL_MS,
        ms: LAYER_BUILD_LOCK_RETRY_MS,
        maxRetries: LAYER_BUILD_LOCK_MAX_RETRIES,
      },
    );
  }

  async ensureSdkLayer({
    flatApplication,
    applicationUniversalIdentifier,
  }: LayerAppContext): Promise<void> {
    const sdkLayerPath = getLocalSdkLayerPath({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier,
    });
    const sdkNodeModulesPath = join(sdkLayerPath, 'node_modules');
    const sdkReadySentinelPath = join(sdkLayerPath, LAYER_BUILD_READY_SENTINEL);

    if (
      (await pathExists(sdkReadySentinelPath)) &&
      !flatApplication.isSdkLayerStale
    ) {
      return;
    }

    const lockKey = `local-driver-sdk-layer:${flatApplication.workspaceId}:${applicationUniversalIdentifier}`;

    await this.cacheLockService.withLock(
      async () => {
        const { flatApplicationMaps } =
          await this.workspaceCacheService.getOrRecompute(
            flatApplication.workspaceId,
            ['flatApplicationMaps'],
          );
        const freshFlatApplication =
          flatApplicationMaps.byId[flatApplication.id];
        const isStale = freshFlatApplication?.isSdkLayerStale ?? true;

        if ((await pathExists(sdkReadySentinelPath)) && !isStale) {
          return;
        }

        const buildStartedAt = Date.now();

        await fs.rm(sdkLayerPath, { recursive: true, force: true });

        const sdkPackagePath = join(sdkNodeModulesPath, 'twenty-client-sdk');

        await this.sdkClientArchiveService.downloadAndExtractToPackage({
          workspaceId: flatApplication.workspaceId,
          applicationId: flatApplication.id,
          applicationUniversalIdentifier,
          targetPackagePath: sdkPackagePath,
        });

        await this.sdkClientArchiveService.markSdkLayerFresh({
          applicationId: flatApplication.id,
          workspaceId: flatApplication.workspaceId,
        });

        await fs.writeFile(sdkReadySentinelPath, '');

        this.logger.log(
          `Built SDK layer for application ${flatApplication.id} in ${Date.now() - buildStartedAt}ms`,
        );
      },
      lockKey,
      {
        ttl: LAYER_BUILD_LOCK_TTL_MS,
        ms: LAYER_BUILD_LOCK_RETRY_MS,
        maxRetries: LAYER_BUILD_LOCK_MAX_RETRIES,
      },
    );
  }
}
