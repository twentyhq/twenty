import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildActorApplicationUniversalIdentifierColumnTargets } from 'src/database/commands/upgrade-version-command/2-28/utils/build-actor-application-universal-identifier-column-targets.util';
import { buildAddActorApplicationUniversalIdentifierColumnsSql } from 'src/database/commands/upgrade-version-command/2-28/utils/build-add-actor-application-universal-identifier-columns-sql.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.28.0', 1785943810000)
@Command({
  name: 'upgrade:2-28:add-application-universal-identifier-to-actor',
  description:
    'Add the nullable applicationUniversalIdentifier column to ACTOR fields in existing workspaces',
})
export class AddApplicationUniversalIdentifierToActorCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);
    const actorApplicationUniversalIdentifierColumnTargets =
      buildActorApplicationUniversalIdentifierColumnTargets({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    if (actorApplicationUniversalIdentifierColumnTargets.length === 0) {
      this.logger.log(
        `No local ACTOR fields found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;

    if (isDryRun) {
      const actorApplicationUniversalIdentifierColumnCount =
        actorApplicationUniversalIdentifierColumnTargets.flatMap(
          ({ columnNames }) => columnNames,
        ).length;

      this.logger.log(
        `[DRY RUN] Would add ${actorApplicationUniversalIdentifierColumnCount} nullable ACTOR application identity columns across ${actorApplicationUniversalIdentifierColumnTargets.length} tables for workspace ${workspaceId}`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      for (const actorApplicationUniversalIdentifierColumnTarget of actorApplicationUniversalIdentifierColumnTargets) {
        await queryRunner.query(
          buildAddActorApplicationUniversalIdentifierColumnsSql({
            schemaName,
            actorApplicationUniversalIdentifierColumnTarget,
          }),
        );
      }
    } finally {
      await queryRunner.release();
    }

    this.logger.log(
      `Added nullable ACTOR application identity columns across ${actorApplicationUniversalIdentifierColumnTargets.length} tables for workspace ${workspaceId}`,
    );
  }
}
