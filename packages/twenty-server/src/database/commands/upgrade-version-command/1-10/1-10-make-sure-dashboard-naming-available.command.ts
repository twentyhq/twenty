import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:1-10:make-sure-dashboard-naming-available',
  description: 'Make sure the dashboard naming is available',
})
export class MakeSureDashboardNamingAvailableCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const potentialCustomDashboardObjectMetadata =
      await this.objectMetadataRepository.findOne({
        where: {
          nameSingular: 'dashboard',
          workspaceId,
          isCustom: true,
        },
      });

    if (!isDefined(potentialCustomDashboardObjectMetadata)) {
      this.logger.log(
        `No custom dashboard object metadata found for workspace ${workspaceId}. Skipping...`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would have updated the dashboard object metadata for workspace ${workspaceId}. Skipping...`,
      );

      return;
    }

    this.logger.log(
      `Updating the dashboard object metadata for workspace ${workspaceId}...`,
    );

    await this.objectMetadataService.updateOneObject({
      workspaceId,
      updateObjectInput: {
        id: potentialCustomDashboardObjectMetadata.id,
        update: {
          nameSingular: 'myDashboard',
          namePlural: 'myDashboards',
          labelSingular: 'My Dashboard',
          labelPlural: 'My Dashboards',
        },
      },
    });
    this.logger.log(
      `Updated the dashboard object metadata for workspace ${workspaceId}...`,
    );
  }
}
