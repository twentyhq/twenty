import { Command } from 'nest-commander';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { LOGIC_FUNCTION_PREBUILT_CONVERSION_BATCH_SIZE } from 'src/database/commands/upgrade-version-command/2-39/constants/convert-logic-functions-to-prebuilt-batch-size.constant';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunctionMaps } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function-maps.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { isLogicFunctionEligibleForPrebuiltConversion } from 'src/engine/metadata-modules/logic-function/utils/is-logic-function-eligible-for-prebuilt-conversion.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

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
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options.dryRun ?? false;

    // Enabling is skipped when already on: enableFeatureFlags invalidates and
    // recomputes the workspace cache, which is wasteful across every workspace
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

    // Read once per workspace rather than per application: the conversions are
    // disjoint by application, so a single snapshot stays correct for all of them
    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps', 'flatApplicationMaps'],
        },
      );

    const applicationIdsToConvert = Object.keys(
      flatLogicFunctionMaps.universalIdentifiersByApplicationId,
    ).filter(
      (applicationId) =>
        this.findLogicFunctionsToConvert({
          applicationId,
          flatLogicFunctionMaps,
          flatApplicationMaps,
        }).length > 0,
    );

    if (applicationIdsToConvert.length === 0) {
      return;
    }

    if (dryRun) {
      this.logger.log(
        `Would ensure ${FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED} is enabled and convert logic functions of ${applicationIdsToConvert.length} application(s) on workspace ${workspaceId}`,
      );

      return;
    }

    await this.convertApplicationsInBatches({
      applicationIds: applicationIdsToConvert,
      workspaceId,
      flatLogicFunctionMaps,
      flatApplicationMaps,
    });
  }

  private async convertApplicationsInBatches({
    applicationIds,
    workspaceId,
    flatLogicFunctionMaps,
    flatApplicationMaps,
  }: {
    applicationIds: string[];
    workspaceId: string;
    flatLogicFunctionMaps: FlatLogicFunctionMaps;
    flatApplicationMaps: FlatApplicationCacheMaps;
  }): Promise<void> {
    let convertedLogicFunctionCount = 0;
    const failedApplicationIds: string[] = [];

    for (
      let batchStart = 0;
      batchStart < applicationIds.length;
      batchStart += LOGIC_FUNCTION_PREBUILT_CONVERSION_BATCH_SIZE
    ) {
      const batch = applicationIds.slice(
        batchStart,
        batchStart + LOGIC_FUNCTION_PREBUILT_CONVERSION_BATCH_SIZE,
      );

      const results = await Promise.allSettled(
        batch.map((applicationId) =>
          this.convertApplicationLogicFunctionsToPrebuilt({
            workspaceId,
            applicationId,
            flatLogicFunctionMaps,
            flatApplicationMaps,
          }),
        ),
      );

      results.forEach((result, batchIndex) => {
        if (result.status === 'fulfilled') {
          convertedLogicFunctionCount += result.value.length;

          return;
        }

        failedApplicationIds.push(batch[batchIndex]);

        this.logger.error(
          `Failed to convert logic functions of application '${batch[batchIndex]}' on workspace ${workspaceId}: ${
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason)
          }`,
        );
      });
    }

    // A conversion failure must not fail the upgrade: prebuilt mode is an
    // optimization and the command is idempotent, so a rerun retries
    this.logger.log(
      `Converted ${convertedLogicFunctionCount} logic function(s) on workspace ${workspaceId}` +
        (failedApplicationIds.length > 0
          ? `, ${failedApplicationIds.length} application(s) failed: ${failedApplicationIds.join(', ')}`
          : ''),
    );
  }

  private async convertApplicationLogicFunctionsToPrebuilt({
    workspaceId,
    applicationId,
    flatLogicFunctionMaps,
    flatApplicationMaps,
  }: {
    workspaceId: string;
    applicationId: string;
    flatLogicFunctionMaps: FlatLogicFunctionMaps;
    flatApplicationMaps: FlatApplicationCacheMaps;
  }): Promise<FlatLogicFunction[]> {
    const flatApplication = findActiveFlatApplicationById(
      flatApplicationMaps,
      applicationId,
    );

    if (!isDefined(flatApplication)) {
      this.logger.warn(
        `Skipping prebuilt conversion of application '${applicationId}' (workspace=${workspaceId}): application is missing or deleted`,
      );

      return [];
    }

    const flatLogicFunctionsToConvert = this.findLogicFunctionsToConvert({
      applicationId,
      flatLogicFunctionMaps,
      flatApplicationMaps,
    });

    if (flatLogicFunctionsToConvert.length === 0) {
      return [];
    }

    const convertedFlatLogicFunctions = flatLogicFunctionsToConvert.map(
      (flatLogicFunction) => ({
        ...flatLogicFunction,
        executionMode: LogicFunctionExecutionMode.PREBUILT,
      }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: convertedFlatLogicFunctions,
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        `Multiple validation errors occurred while converting logic functions of application '${applicationId}' to prebuilt`,
      );
    }

    return convertedFlatLogicFunctions;
  }

  private findLogicFunctionsToConvert({
    applicationId,
    flatLogicFunctionMaps,
    flatApplicationMaps,
  }: {
    applicationId: string;
    flatLogicFunctionMaps: FlatLogicFunctionMaps;
    flatApplicationMaps: FlatApplicationCacheMaps;
  }): FlatLogicFunction[] {
    const flatApplication = findActiveFlatApplicationById(
      flatApplicationMaps,
      applicationId,
    );

    if (!isDefined(flatApplication)) {
      return [];
    }

    const universalIdentifiers =
      flatLogicFunctionMaps.universalIdentifiersByApplicationId[
        applicationId
      ] ?? [];

    return universalIdentifiers
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
      );
  }
}
