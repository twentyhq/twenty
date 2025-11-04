import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  seedStandardApplications,
  SeedStandardApplicationsArgs,
} from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-standard-applications.util';
import { TWENTY_STANDARD_APPLICATION, TWENTY_WORKFLOW_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';

@Command({
  name: 'upgrade:1-11:seed-standard-applications',
  description:
    'Seed twenty-standard and twenty-workflow applications for workspaces that do not have them',
})
export class SeedStandardApplicationsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
    this.logger.log(
      `Checking standard applications for workspace ${workspaceId}`,
    );

    const existingApplications = await this.applicationRepository.find({
      where: {
        workspaceId,
        universalIdentifier: In([
          TWENTY_STANDARD_APPLICATION,
          TWENTY_WORKFLOW_APPLICATION,
        ]),
      },
    });

    const existingIds = new Set(
      existingApplications.map((app) => app.universalIdentifier),
    );

    const applicationToSync: SeedStandardApplicationsArgs['applicationsToSeed'] =
      {
        twentyStandard: !existingIds.has(
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
        ),
        twentyWorkflows: !existingIds.has(
          TWENTY_WORKFLOW_APPLICATION.universalIdentifier,
        ),
      };

    // TODO refactor logging to be more human readable
    this.logger.log(
      `About to seed twenty standard: ${applicationToSync.twentyStandard} and twenty workflow: ${applicationToSync.twentyWorkflows}`,
    );
    if (!options.dryRun) {
      try {
        await seedStandardApplications({
          applicationService: this.applicationService,
          workspaceId,
          applicationsToSeed: {
            twentyStandard: !existingIds.has(
              TWENTY_STANDARD_APPLICATION.universalIdentifier,
            ),
            twentyWorkflows: !existingIds.has(
              TWENTY_WORKFLOW_APPLICATION.universalIdentifier,
            ),
          },
        });

        this.logger.log(
          `Successfully seeded twenty standard: ${applicationToSync.twentyStandard} and twenty workflow: ${applicationToSync.twentyWorkflows}`,
        );
      } catch (e) {
        this.logger.error(
          `Failed to seed twenty standard: ${applicationToSync.twentyStandard} and twenty workflow: ${applicationToSync.twentyWorkflows}`,
          e,
        );
      }
    }
  }
}
