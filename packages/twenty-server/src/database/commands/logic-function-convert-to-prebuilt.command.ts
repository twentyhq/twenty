import chalk from 'chalk';
import { Command, Option } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import {
  type RunOnWorkspaceArgs,
  WorkspaceCommandRunner,
} from 'src/database/commands/command-runners/workspace.command-runner';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF } from 'src/engine/core-modules/logic-function/logic-function-trigger/constants/logic-function-queue-retry-backoff.constant';
import { LOGIC_FUNCTION_PREBUILT_CONVERSION_JOB_PRIORITY } from 'src/engine/metadata-modules/logic-function/constants/logic-function-prebuilt-conversion-job-priority.constant';
import { LOGIC_FUNCTION_PREBUILT_CONVERSION_RETRY_LIMIT } from 'src/engine/metadata-modules/logic-function/constants/logic-function-prebuilt-conversion-retry-limit.constant';
import {
  ConvertApplicationLogicFunctionsToPrebuiltJob,
  type ConvertApplicationLogicFunctionsToPrebuiltJobData,
} from 'src/engine/metadata-modules/logic-function/jobs/convert-application-logic-functions-to-prebuilt.job';
import { LogicFunctionPrebuiltConversionService } from 'src/engine/metadata-modules/logic-function/services/logic-function-prebuilt-conversion.service';

@Command({
  name: 'logic-function:convert-to-prebuilt',
  description:
    'Enqueue the conversion of application logic functions from LIVE to PREBUILT execution mode, one job per application. Idempotent.',
})
export class LogicFunctionConvertToPrebuiltCommand extends WorkspaceCommandRunner {
  private updateFeatureFlag = false;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly logicFunctionPrebuiltConversionService: LogicFunctionPrebuiltConversionService,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super(workspaceIteratorService, [WorkspaceActivationStatus.ACTIVE]);
  }

  @Option({
    flags: '--update-feature-flag',
    description: `Enable ${FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED} on every processed workspace instead of skipping the ones that do not have it`,
    required: false,
  })
  parseUpdateFeatureFlag(): boolean {
    this.updateFeatureFlag = true;

    return true;
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    index,
    total,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options.dryRun ?? false;
    const dryRunPrefix = dryRun ? '[DRY RUN] ' : '';

    const isPrebuiltModeEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED,
        workspaceId,
      );

    if (!isPrebuiltModeEnabled && !this.updateFeatureFlag) {
      this.logger.log(
        `Skipping workspace ${workspaceId} (${index + 1}/${total}): ${FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED} is disabled`,
      );

      return;
    }

    if (!isPrebuiltModeEnabled && !dryRun) {
      await this.featureFlagService.enableFeatureFlags(
        [FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED],
        workspaceId,
      );
    }

    if (!isPrebuiltModeEnabled) {
      this.logger.log(
        `${dryRunPrefix}Enabled ${FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED} on workspace ${workspaceId}`,
      );
    }

    const applicationIdsToConvert =
      await this.logicFunctionPrebuiltConversionService.findApplicationIdsToConvert(
        { workspaceId },
      );

    if (applicationIdsToConvert.length === 0) {
      this.logger.log(
        `No logic function to convert on workspace ${workspaceId} (${index + 1}/${total})`,
      );

      return;
    }

    this.logger.log(
      `${dryRunPrefix}Enqueuing ${applicationIdsToConvert.length} conversion job(s) on workspace ${workspaceId} (${index + 1}/${total})`,
    );

    if (dryRun) {
      return;
    }

    await this.messageQueueService.bulkAdd<ConvertApplicationLogicFunctionsToPrebuiltJobData>(
      ConvertApplicationLogicFunctionsToPrebuiltJob.name,
      applicationIdsToConvert.map((applicationId) => ({
        workspaceId,
        applicationId,
      })),
      {
        priority: LOGIC_FUNCTION_PREBUILT_CONVERSION_JOB_PRIORITY,
        retryLimit: LOGIC_FUNCTION_PREBUILT_CONVERSION_RETRY_LIMIT,
        backoff: LOGIC_FUNCTION_QUEUE_RETRY_BACKOFF,
      },
    );

    if (options.verbose) {
      this.logger.log(
        chalk.yellow(
          `Enqueued conversion of applications ${applicationIdsToConvert.join(', ')} on workspace ${workspaceId}`,
        ),
      );
    }
  }
}
