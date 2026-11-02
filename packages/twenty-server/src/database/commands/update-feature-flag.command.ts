import { Command, Option } from 'nest-commander';
import { type FeatureFlagKey } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import {
  WorkspaceCommandRunner,
  type RunOnWorkspaceArgs,
  type WorkspaceCommandOptions,
} from 'src/database/commands/command-runners/workspace.command-runner';
import {
  FeatureFlagException,
  FeatureFlagExceptionCode,
} from 'src/engine/core-modules/feature-flag/feature-flag.exception';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { featureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/feature-flag.validate';

type UpdateFeatureFlagCommandOptions = WorkspaceCommandOptions & {
  flag: FeatureFlagKey;
  value: boolean;
};

@Command({
  name: 'feature-flag:update',
  description:
    'Set a feature flag to a value on one workspace (-w), a batch (--workspace-count-limit, --start-from-workspace-id) or all workspaces',
})
export class UpdateFeatureFlagCommand extends WorkspaceCommandRunner<UpdateFeatureFlagCommandOptions> {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly featureFlagService: FeatureFlagService,
  ) {
    // Feature flags live in core, so they can be set regardless of workspace provisioning state
    super(workspaceIteratorService, Object.values(WorkspaceActivationStatus));
  }

  @Option({
    flags: '-f, --flag <flag>',
    description: 'Feature flag key, e.g. IS_AI_ENABLED',
    required: true,
  })
  parseFlag(val: string): FeatureFlagKey {
    featureFlagValidator.assertIsFeatureFlagKey(
      val,
      new FeatureFlagException(
        `Invalid feature flag key: ${val}`,
        FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY,
      ),
    );

    return val;
  }

  @Option({
    flags: '--value <value>',
    description: 'Feature flag value: true or false',
    required: true,
  })
  parseValue(val: string): boolean {
    if (val !== 'true' && val !== 'false') {
      throw new Error(
        `Feature flag value must be "true" or "false", got ${val}`,
      );
    }

    return val === 'true';
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    index,
    total,
  }: RunOnWorkspaceArgs<UpdateFeatureFlagCommandOptions>): Promise<void> {
    const { flag, value, dryRun } = options;

    this.logger.log(
      `${dryRun ? '[DRY RUN] ' : ''}Setting ${flag} to ${value} on workspace ${workspaceId} (${index + 1}/${total})`,
    );

    if (dryRun) {
      return;
    }

    await this.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId,
      featureFlag: flag,
      value,
    });
  }
}
