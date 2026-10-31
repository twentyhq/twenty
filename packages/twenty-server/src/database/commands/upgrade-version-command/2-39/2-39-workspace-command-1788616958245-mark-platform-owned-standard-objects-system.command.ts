import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

// The standard objects the standard application declared SYSTEM writable
const PLATFORM_OWNED_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociationMessageFolder
    .universalIdentifier,
  STANDARD_OBJECTS.accessGroup.universalIdentifier,
  STANDARD_OBJECTS.recordShare.universalIdentifier,
  STANDARD_OBJECTS.shortLink.universalIdentifier,
  STANDARD_OBJECTS.workflowAutomatedTrigger.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.39.0', 1788616958245)
@Command({
  name: 'upgrade:2-39:mark-platform-owned-standard-objects-system',
  description:
    'Sync the writability of standard objects with the standard-application definitions: platform-owned objects become SYSTEM on existing workspaces',
})
export class MarkPlatformOwnedStandardObjectsSystemCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const filter = `"workspaceId" = $1 AND "universalIdentifier" = ANY($2) AND writability <> 'SYSTEM'`;
    const parameters = [
      workspaceId,
      PLATFORM_OWNED_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
    ];

    if (options.dryRun) {
      const [{ count }] = await this.coreDataSource.query(
        `SELECT COUNT(*)::int AS "count" FROM core."objectMetadata" WHERE ${filter}`,
        parameters,
      );

      this.logger.log(
        `[DRY RUN] Would mark ${count} standard object(s) as SYSTEM for workspace ${workspaceId}`,
      );

      return;
    }

    // Nothing reads writability at runtime, but a later upgrade turns SYSTEM into disabled actions
    await this.coreDataSource.query(
      `UPDATE core."objectMetadata" SET writability = 'SYSTEM' WHERE ${filter}`,
      parameters,
    );
  }
}
