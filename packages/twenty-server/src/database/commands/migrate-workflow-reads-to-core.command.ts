import { Command } from 'nest-commander';

import { FeatureFlagKey } from 'twenty-shared/types';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkflowCoreConsistencyService } from 'src/modules/workflow/workflow-core-consistency/services/workflow-core-consistency.service';
import { flattenWorkflowCoreDrift } from 'src/modules/workflow/workflow-core-consistency/utils/flatten-workflow-core-drift.util';

const WORKFLOW_CORE_CUTOVER_FLAGS = [
  FeatureFlagKey.IS_WORKFLOW_VERSION_IN_CORE_ENABLED,
  FeatureFlagKey.IS_WORKFLOW_DISPATCH_FROM_CORE_ENABLED,
];

@Command({
  name: 'workflow:migrate-to-core',
  description:
    'Per workspace: verify workspace/core workflow consistency, then enable the core read and dispatch flags. Workspaces with drift are reported and skipped.',
})
export class MigrateWorkflowReadsToCoreCommand extends ProvisionedWorkspaceCommandRunner {
  private readonly migratedWorkspaceIds: string[] = [];
  private readonly driftedWorkspaceIds: string[] = [];

  constructor(
    protected override readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workflowCoreConsistencyService: WorkflowCoreConsistencyService,
    private readonly featureFlagService: FeatureFlagService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    index,
    total,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options.dryRun ?? false;
    const prefix = `${dryRun ? '[DRY RUN] ' : ''}(${index + 1}/${total}) workspace ${workspaceId}`;

    const featureFlagsMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspaceId);

    const missingFlags = WORKFLOW_CORE_CUTOVER_FLAGS.filter(
      (flag) => featureFlagsMap[flag] !== true,
    );

    if (missingFlags.length === 0) {
      this.logger.log(`${prefix}: already migrated, skipping`);

      return;
    }

    const consistencyResult =
      await this.workflowCoreConsistencyService.checkWorkspace(
        workspaceId,
        getWorkspaceSchemaName(workspaceId),
      );

    const driftEntries = flattenWorkflowCoreDrift(consistencyResult);

    if (driftEntries.length > 0) {
      this.driftedWorkspaceIds.push(workspaceId);
      this.logger.warn(
        `${prefix}: DRIFT detected, skipping (${driftEntries.join(', ')})`,
      );

      return;
    }

    if (dryRun) {
      this.logger.log(
        `${prefix}: consistent, would enable ${missingFlags.join(', ')}`,
      );

      return;
    }

    await this.featureFlagService.enableFeatureFlags(missingFlags, workspaceId);

    this.migratedWorkspaceIds.push(workspaceId);
    this.logger.log(`${prefix}: migrated (${missingFlags.join(', ')})`);
  }

  override async run(
    passedParams: string[],
    options: Parameters<ProvisionedWorkspaceCommandRunner['run']>[1],
  ): Promise<void> {
    await super.run(passedParams, options);

    this.logger.log(
      `Migration done: ${this.migratedWorkspaceIds.length} migrated, ${this.driftedWorkspaceIds.length} skipped on drift`,
    );

    if (this.driftedWorkspaceIds.length > 0) {
      this.logger.warn(
        `Drifted workspaces needing a resync before retry: ${this.driftedWorkspaceIds.join(', ')}`,
      );
    }
  }
}
