import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

@RegisteredWorkspaceCommand('2.57.0', 1794067670000)
@Command({
  name: 'upgrade:2-57:enable-private-records-for-sharing-workspaces',
  description:
    'Enable private records wherever sharing is or was set, since those workspaces may hold private records',
})
export class EnablePrivateRecordsForSharingWorkspacesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly featureFlagService: FeatureFlagService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const sharingFlagRows: { exists: number }[] = await this.coreDataSource.query(
      `SELECT 1 AS "exists" FROM core."featureFlag" WHERE "workspaceId" = $1 AND "key" = $2`,
      [workspaceId, FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED],
    );

    if (sharingFlagRows.length === 0 || options.dryRun) {
      return;
    }

    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED],
      workspaceId,
    );
  }
}
