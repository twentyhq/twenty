import { Inject, Injectable, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { isLogicFunctionReadyForPrebuiltInstall } from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-ready-for-prebuilt-install.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WARM_UP_CHUNK_SIZE = 10;

@Injectable()
export class LogicFunctionPrebuiltWarmUpService {
  private readonly logger = new Logger(LogicFunctionPrebuiltWarmUpService.name);

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {}

  async ensurePrebuiltBundleInstalled({
    flatLogicFunction,
    flatApplication,
  }: {
    flatLogicFunction: FlatLogicFunction;
    flatApplication: FlatApplication;
  }): Promise<void> {
    const driver = this.logicFunctionDriverFactory.getCurrentDriver();
    let installedChecksum: string | null = null;

    try {
      installedChecksum =
        await driver.getInstalledBundleChecksum(flatLogicFunction);

      if (installedChecksum === flatLogicFunction.checksum) {
        return;
      }

      await driver.installPrebuiltBundle({
        flatLogicFunction,
        flatApplication,
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
      });
    } catch (error) {
      const cause = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Failed to install prebuilt bundle on-demand for function '${flatLogicFunction.id}' ` +
          `(installed=${installedChecksum ?? 'none'}, expected=${flatLogicFunction.checksum ?? 'none'}): ` +
          `${cause}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new LogicFunctionException(
        `Failed to install the prebuilt bundle for function '${flatLogicFunction.id}' ` +
          `(installed=${installedChecksum ?? 'none'}, expected=${flatLogicFunction.checksum ?? 'none'})`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_PREBUILT_BUNDLE_NOT_INSTALLED,
      );
    }
  }

  async warmUpApplicationLogicFunctions({
    workspaceId,
    applicationId,
    logicFunctionUniversalIdentifiers,
  }: {
    workspaceId: string;
    applicationId: string;
    logicFunctionUniversalIdentifiers: string[];
  }): Promise<void> {
    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
        'flatApplicationMaps',
      ]);

    const flatApplication = flatApplicationMaps.byId[applicationId];

    if (!isDefined(flatApplication)) {
      this.logger.warn(
        `Skipping prebuilt warm-up: application ${applicationId} not found in workspace ${workspaceId}`,
      );

      return;
    }

    const flatLogicFunctions = logicFunctionUniversalIdentifiers
      .map(
        (universalIdentifier) =>
          flatLogicFunctionMaps.byUniversalIdentifier[universalIdentifier],
      )
      .filter(isDefined)
      .filter(
        (flatLogicFunction) =>
          flatLogicFunction.applicationId === applicationId &&
          isLogicFunctionReadyForPrebuiltInstall(flatLogicFunction),
      );

    const failedLogicFunctionIds: string[] = [];

    for (const flatLogicFunctionsChunk of chunk(
      flatLogicFunctions,
      WARM_UP_CHUNK_SIZE,
    )) {
      const results = await Promise.allSettled(
        flatLogicFunctionsChunk.map((flatLogicFunction) =>
          this.ensurePrebuiltBundleInstalled({
            flatLogicFunction,
            flatApplication,
          }),
        ),
      );

      failedLogicFunctionIds.push(
        ...flatLogicFunctionsChunk
          .filter(
            (_flatLogicFunction, index) => results[index].status === 'rejected',
          )
          .map((flatLogicFunction) => flatLogicFunction.id),
      );
    }

    if (failedLogicFunctionIds.length > 0) {
      throw new LogicFunctionException(
        `Failed to warm up ${failedLogicFunctionIds.length} of ${flatLogicFunctions.length} prebuilt logic functions ` +
          `for application ${applicationId} in workspace ${workspaceId}: ${failedLogicFunctionIds.join(', ')}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_PREBUILT_BUNDLE_NOT_INSTALLED,
      );
    }
  }
}
