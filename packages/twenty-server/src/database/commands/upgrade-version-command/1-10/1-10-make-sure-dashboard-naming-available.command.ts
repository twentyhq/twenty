import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataServiceV2 } from 'src/engine/metadata-modules/object-metadata/object-metadata-v2.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:1-10:make-sure-dashboard-naming-available',
  description: 'Make sure the dashboard naming is available',
})
export class MakeSureDashboardNamingAvailableCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly objectMetadataServiceV2: ObjectMetadataServiceV2,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
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

    await this.objectMetadataServiceV2.updateOne({
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
