import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Command } from 'nest-commander';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';

@Command({
  name: 'upgrade:1-12:set-standard-application-not-uninstallable',
  description: 'Set canBeUninstalled flag to false for standard applications',
})
export class SetStandardApplicationNotUninstallableCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
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
        `Checking standard applications for workspace ${workspaceId}`,
      );

      const existingApplications = await this.applicationRepository.find({
        where: [
          {
            workspaceId,
            universalIdentifier:
              TWENTY_STANDARD_APPLICATION.universalIdentifier,
          },
          {
            workspaceId,
            description: 'Workspace custom application',
            sourcePath: 'workspace-custom',
          },
        ],
      });

      if (options.dryRun) {
        return;
      }

      for (const existingApplication of existingApplications) {
        await this.applicationService.update(existingApplication.id, {
          canBeUninstalled: false,
        });
      }
      this.logger.log(`Successfully updated standard applications`);
    } catch (e) {
      this.logger.error(`Failed to update standard applications`, e);
    }
  }
}
