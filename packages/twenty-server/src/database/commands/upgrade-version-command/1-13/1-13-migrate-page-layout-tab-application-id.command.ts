import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  WorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:1-13:migrate-page-layout-tab-application-id',
  description:
    'Migrate existing PageLayoutTab entities to set applicationId and universalIdentifier',
})
export class MigratePageLayoutTabApplicationIdCommand extends WorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(PageLayoutTabEntity)
    private readonly pageLayoutTabRepository: Repository<PageLayoutTabEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService, [
      WorkspaceActivationStatus.ONGOING_CREATION,
      WorkspaceActivationStatus.PENDING_CREATION,
      WorkspaceActivationStatus.ACTIVE,
      WorkspaceActivationStatus.INACTIVE,
      WorkspaceActivationStatus.SUSPENDED,
    ]);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Migrating PageLayoutTab applicationId for workspace ${workspaceId}`,
    );

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!isDefined(workspace)) {
      throw new Error(`${workspaceId} workspace not found`);
    }

    if (!isDefined(workspace.workspaceCustomApplicationId)) {
      this.logger.log(
        `${workspaceId} skipping PageLayoutTab migration as workspace custom application does not exist`,
      );

      return;
    }

    const pageLayoutTabs = await this.pageLayoutTabRepository.find({
      where: { workspaceId },
    });

    if (pageLayoutTabs.length === 0) {
      this.logger.log(
        `${workspaceId} no PageLayoutTab entities to migrate`,
      );

      return;
    }

    let migratedCount = 0;

    for (const pageLayoutTab of pageLayoutTabs) {
      await this.pageLayoutTabRepository.update(pageLayoutTab.id, {
        applicationId: workspace.workspaceCustomApplicationId,
        universalIdentifier: v4(),
      });
      migratedCount++;
    }

    this.logger.log(
      `Successfully migrated ${migratedCount} PageLayoutTab entities for workspace ${workspaceId}`,
    );
  }
}

