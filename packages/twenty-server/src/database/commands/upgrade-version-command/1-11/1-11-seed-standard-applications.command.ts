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
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-application-id';
import { TWENTY_WORKFLOW_APPLICATION_ID } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-workflow-application-id';

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
          TWENTY_WORKFLOW_APPLICATION_ID,
        ]),
      },
    });

    const existingIds = new Set(
      existingApplications.map((app) => app.universalIdentifier),
    );

    const applicationsToCreate: Array<{
      universalIdentifier: string;
      name: string;
      description: string;
      sourcePath: string;
    }> = [];

    if (!existingIds.has(TWENTY_STANDARD_APPLICATION.universalIdentifier)) {
      applicationsToCreate.push({
        universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
        name: 'Twenty CRM',
        description:
          'Twenty is an open-source CRM that allows you to manage your sales and customer relationships',
        sourcePath: 'system/twenty-standard',
      });
    }

    if (!existingIds.has(TWENTY_WORKFLOW_APPLICATION_ID)) {
      applicationsToCreate.push({
        universalIdentifier: TWENTY_WORKFLOW_APPLICATION_ID,
        name: 'Twenty Workflows',
        description: 'Workflow automation engine for Twenty CRM',
        sourcePath: 'system/twenty-workflow',
      });
    }

    if (applicationsToCreate.length === 0) {
      this.logger.log(
        `All standard applications already exist for workspace ${workspaceId}. Skipping...`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would have created ${applicationsToCreate.length} application(s) for workspace ${workspaceId}: ${applicationsToCreate.map((a) => a.name).join(', ')}`,
      );

      return;
    }

    // Create applications without serverless function layers (system applications don't need code execution)
    for (const appConfig of applicationsToCreate) {
      await this.applicationService.create({
        universalIdentifier: appConfig.universalIdentifier,
        name: appConfig.name,
        description: appConfig.description,
        version: '1.0.0',
        sourcePath: appConfig.sourcePath,
        serverlessFunctionLayerId: null,
        workspaceId,
      });

      this.logger.log(
        `Created application ${appConfig.name} (${appConfig.universalIdentifier}) for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully seeded ${applicationsToCreate.length} standard application(s) for workspace ${workspaceId}`,
    );
  }
}
