import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.54.0', 1793266780731)
@Command({
  name: 'upgrade:2-54:strip-server-routes-from-custom-app-logic-functions',
  description:
    'Clear serverRouteTriggerSettings on Custom app logic functions so they can no longer answer a public server route',
})
export class StripServerRoutesFromCustomAppLogicFunctionsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const affected: { id: string }[] = await this.coreDataSource.query(
      `SELECT id FROM core."logicFunction"
       WHERE "workspaceId" = $1
         AND "applicationId" = $2
         AND "serverRouteTriggerSettings" IS NOT NULL`,
      [workspaceId, workspaceCustomFlatApplication.id],
    );

    if (affected.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would clear server routes on ${affected.length} Custom app logic function(s)`,
      );

      return;
    }

    await this.coreDataSource.query(
      `UPDATE core."logicFunction"
         SET "serverRouteTriggerSettings" = NULL
       WHERE "workspaceId" = $1
         AND "applicationId" = $2
         AND "serverRouteTriggerSettings" IS NOT NULL`,
      [workspaceId, workspaceCustomFlatApplication.id],
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      getMetadataFlatEntityMapsKey('logicFunction'),
    ]);

    this.logger.log(
      `Workspace ${workspaceId}: cleared server routes on ${affected.length} Custom app logic function(s)`,
    );
  }
}
