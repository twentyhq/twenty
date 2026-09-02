import { InjectDataSource } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { Command } from 'nest-commander';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunctionMaps } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function-maps.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { isLogicFunctionEligibleForPrebuiltConversion } from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-eligible-for-prebuilt-conversion.util';
import { UpdateLogicFunctionActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/logic-function/services/update-logic-function-action-handler.service';

const LOGIC_FUNCTION_PREBUILT_CONVERSION_BATCH_SIZE = 100;

type LogicFunctionConversionTarget = {
  flatLogicFunction: FlatLogicFunction;
  flatApplication: FlatApplication;
};

@RegisteredWorkspaceCommand('2.39.0', 1788338950836)
@Command({
  name: 'upgrade:2-39:convert-logic-functions-to-prebuilt',
  description:
    'Convert packaged application logic functions from LIVE to PREBUILT execution mode. Idempotent.',
})
export class ConvertLogicFunctionsToPrebuiltCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly updateLogicFunctionActionHandlerService: UpdateLogicFunctionActionHandlerService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options.dryRun ?? false;

    const isPrebuiltModeEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED,
        workspaceId,
      );

    if (!isPrebuiltModeEnabled && !dryRun) {
      await this.featureFlagService.enableFeatureFlags(
        [FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED],
        workspaceId,
      );
    }

    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps', 'flatApplicationMaps'],
        },
      );

    const conversionTargets = this.findLogicFunctionsToConvert({
      flatLogicFunctionMaps,
      flatApplicationMaps,
    });

    if (conversionTargets.length === 0) {
      return;
    }

    if (dryRun) {
      this.logger.log(
        `Would ensure ${FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED} is enabled and convert ${conversionTargets.length} logic function(s) on workspace ${workspaceId}`,
      );

      return;
    }

    const convertedCount = await this.convertLogicFunctionsInBatches({
      conversionTargets,
      workspaceId,
      allFlatEntityMaps: {
        ...createEmptyAllFlatEntityMaps(),
        flatLogicFunctionMaps,
      },
    });

    if (convertedCount > 0) {
      await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatLogicFunctionMaps'],
      });
    }
  }

  private async convertLogicFunctionsInBatches({
    conversionTargets,
    workspaceId,
    allFlatEntityMaps,
  }: {
    conversionTargets: LogicFunctionConversionTarget[];
    workspaceId: string;
    allFlatEntityMaps: AllFlatEntityMaps;
  }): Promise<number> {
    let convertedCount = 0;
    const failedLogicFunctionIds: string[] = [];

    for (const batch of chunk(
      conversionTargets,
      LOGIC_FUNCTION_PREBUILT_CONVERSION_BATCH_SIZE,
    )) {
      const results = await Promise.allSettled(
        batch.map((conversionTarget) =>
          this.convertLogicFunctionToPrebuilt({
            conversionTarget,
            workspaceId,
            allFlatEntityMaps,
          }),
        ),
      );

      results.forEach((result, batchIndex) => {
        if (result.status === 'fulfilled') {
          convertedCount += 1;

          return;
        }

        const { flatLogicFunction } = batch[batchIndex];

        failedLogicFunctionIds.push(flatLogicFunction.id);

        this.logger.error(
          `Failed to convert logic function '${flatLogicFunction.id}' on workspace ${workspaceId}: ${
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason)
          }`,
        );
      });
    }

    this.logger.log(
      `Converted ${convertedCount} logic function(s) on workspace ${workspaceId}` +
        (failedLogicFunctionIds.length > 0
          ? `, ${failedLogicFunctionIds.length} failed: ${failedLogicFunctionIds.join(', ')}`
          : ''),
    );

    return convertedCount;
  }

  private async convertLogicFunctionToPrebuilt({
    conversionTarget: { flatLogicFunction, flatApplication },
    workspaceId,
    allFlatEntityMaps,
  }: {
    conversionTarget: LogicFunctionConversionTarget;
    workspaceId: string;
    allFlatEntityMaps: AllFlatEntityMaps;
  }): Promise<void> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.updateLogicFunctionActionHandlerService.executeForMetadata({
        queryRunner,
        workspaceId,
        allFlatEntityMaps,
        flatApplication,
        action: {
          type: 'update',
          metadataName: 'logicFunction',
          universalIdentifier: flatLogicFunction.universalIdentifier,
          update: { executionMode: LogicFunctionExecutionMode.PREBUILT },
        },
        flatAction: {
          type: 'update',
          metadataName: 'logicFunction',
          entityId: flatLogicFunction.id,
          update: { executionMode: LogicFunctionExecutionMode.PREBUILT },
        },
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private findLogicFunctionsToConvert({
    flatLogicFunctionMaps,
    flatApplicationMaps,
  }: {
    flatLogicFunctionMaps: FlatLogicFunctionMaps;
    flatApplicationMaps: FlatApplicationCacheMaps;
  }): LogicFunctionConversionTarget[] {
    return Object.entries(
      flatLogicFunctionMaps.universalIdentifiersByApplicationId,
    ).flatMap(([applicationId, universalIdentifiers]) => {
      const flatApplication = findActiveFlatApplicationById(
        flatApplicationMaps,
        applicationId,
      );

      if (!isDefined(flatApplication)) {
        return [];
      }

      return (universalIdentifiers ?? [])
        .map(
          (universalIdentifier) =>
            flatLogicFunctionMaps.byUniversalIdentifier[universalIdentifier],
        )
        .filter(
          (flatLogicFunction): flatLogicFunction is FlatLogicFunction =>
            isDefined(flatLogicFunction) &&
            isLogicFunctionEligibleForPrebuiltConversion({
              flatLogicFunction,
              applicationSourceType: flatApplication.sourceType,
            }),
        )
        .map((flatLogicFunction) => ({ flatLogicFunction, flatApplication }));
    });
  }
}
