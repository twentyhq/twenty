import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/core-modules/application/constants/twenty-standard-applications';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:1-11:create-twenty-standard-application',
  description:
    'Create twenty-standard application for workspaces that do not have them',
})
export class CreateTwentyStandardApplicationCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly applicationService: ApplicationService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
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
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
        ]),
      },
    });

    const existingIds = new Set(
      existingApplications.map((app) => app.universalIdentifier),
    );

    if (existingIds.has(TWENTY_STANDARD_APPLICATION.universalIdentifier)) {
      this.logger.log(
        `Skipping twenty standard application as it already exists`,
      );

      return;
    }

    this.logger.log(`About to seed twenty standard application`);
    if (options.dryRun) {
      return;
    }

    try {
      await this.applicationService.createTwentyStandardApplication({
        workspaceId,
      });

      this.logger.log(`Successfully seeded twenty standard`);
    } catch (e) {
      this.logger.error(`Failed to seed twenty standard`, e);
    }
  }
}
