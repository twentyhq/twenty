import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:1-20:generate-application-sdk-clients',
  description:
    'Generate SDK client archives for all existing applications so drivers do not crash with ARCHIVE_NOT_FOUND',
})
export class GenerateApplicationSdkClientsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly sdkClientGenerationService: SdkClientGenerationService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options.dryRun ?? false;

    const applications = await this.applicationRepository.find({
      where: { workspaceId },
    });

    this.logger.log(
      `Found ${applications.length} application(s) in workspace ${workspaceId}`,
    );

    for (const application of applications) {
      if (dryRun) {
        this.logger.log(
          `[DRY RUN] Would generate SDK client for application ${application.universalIdentifier} (${application.id})`,
        );
        continue;
      }

      try {
        await this.sdkClientGenerationService.generateSdkClientForApplication({
          workspaceId,
          applicationId: application.id,
          applicationUniversalIdentifier: application.universalIdentifier,
        });
      } catch (error) {
        this.logger.error(
          `Failed to generate SDK client for application ${application.universalIdentifier} (${application.id}): ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}
