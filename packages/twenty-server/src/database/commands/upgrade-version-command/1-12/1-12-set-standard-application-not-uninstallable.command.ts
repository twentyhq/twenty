import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

// Note: this command needs to be run after CreateWorkspaceCustomApplicationCommand
@Command({
  name: 'upgrade:1-12:set-standard-application-not-uninstallable',
  description: 'Set canBeUninstalled flag to false for standard applications',
})
export class SetStandardApplicationNotUninstallableCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly applicationService: ApplicationService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    try {
      this.logger.log(
        `Checking workspace applications for workspace ${workspaceId}`,
      );

      const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          {
            workspaceId,
          },
        );

      if (options.dryRun) {
        return;
      }

      for (const existingApplication of [
        twentyStandardFlatApplication,
        workspaceCustomFlatApplication,
      ]) {
        await this.applicationService.update(existingApplication.id, {
          canBeUninstalled: false,
        });
      }
      this.logger.log(`Successfully updated workspace application`);
    } catch (e) {
      this.logger.error(`Failed to update workspace application`, e);
    }
  }
}
