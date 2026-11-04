import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';

@RegisteredWorkspaceCommand('2.51.0', 1792675225627)
@Command({
  name: 'upgrade:2-51:delete-connected-accounts-outside-provider-scope',
  description:
    'Delete app connected accounts whose scope differs from their connection provider scope, through the regular disconnect path',
})
export class DeleteConnectedAccountsOutsideProviderScopeCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const connectedAccounts = await this.dataSource.query<{ id: string }[]>(
      `SELECT "connectedAccount".id
         FROM core."connectedAccount" "connectedAccount"
         JOIN core."connectionProvider" "connectionProvider"
           ON "connectionProvider".id = "connectedAccount"."connectionProviderId"
        WHERE "connectedAccount"."workspaceId" = $1
          AND "connectedAccount".scope <> "connectionProvider".scope::text`,
      [workspaceId],
    );

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${connectedAccounts.length} connected account(s) outside their provider scope would be deleted`,
      );

      return;
    }

    await this.connectedAccountMetadataService.deleteMany({
      ids: connectedAccounts.map(({ id }) => id),
      workspaceId,
    });

    this.logger.log(
      `Workspace ${workspaceId}: ${connectedAccounts.length} connected account(s) outside their provider scope deleted`,
    );
  }
}
