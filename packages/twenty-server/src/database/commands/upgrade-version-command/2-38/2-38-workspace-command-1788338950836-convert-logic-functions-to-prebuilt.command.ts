import { Command } from 'nest-commander';

import { FeatureFlagKey } from 'twenty-shared/types';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { LOGIC_FUNCTION_PREBUILT_CONVERSION_BATCH_SIZE } from 'src/engine/metadata-modules/logic-function/constants/logic-function-prebuilt-conversion-batch-size.constant';
import { LogicFunctionPrebuiltConversionService } from 'src/engine/metadata-modules/logic-function/services/logic-function-prebuilt-conversion.service';

@RegisteredWorkspaceCommand('2.38.0', 1788338950836)
@Command({
  name: 'upgrade:2-38:convert-logic-functions-to-prebuilt',
  description:
    'Convert packaged application logic functions from LIVE to PREBUILT execution mode. Idempotent.',
})
export class ConvertLogicFunctionsToPrebuiltCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly logicFunctionPrebuiltConversionService: LogicFunctionPrebuiltConversionService,
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

    const applicationIdsToConvert =
      await this.logicFunctionPrebuiltConversionService.findApplicationIdsToConvert(
        { workspaceId },
      );

    if (applicationIdsToConvert.length === 0) {
      return;
    }

    if (dryRun) {
      this.logger.log(
        `Would enable ${FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED} and convert logic functions of ${applicationIdsToConvert.length} application(s) on workspace ${workspaceId}`,
      );

      return;
    }

    await this.convertApplicationsInBatches({
      applicationIds: applicationIdsToConvert,
      workspaceId,
    });
  }

  private async convertApplicationsInBatches({
    applicationIds,
    workspaceId,
  }: {
    applicationIds: string[];
    workspaceId: string;
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
          this.logicFunctionPrebuiltConversionService.convertApplicationLogicFunctionsToPrebuilt(
            { workspaceId, applicationId },
          ),
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
}
