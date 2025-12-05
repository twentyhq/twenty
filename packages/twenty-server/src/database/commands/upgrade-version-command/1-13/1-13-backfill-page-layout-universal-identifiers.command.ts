import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-widget.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Command({
  name: 'upgrade:1-13:backfill-page-layout-universal-identifiers',
  description:
    'Backfill universalIdentifier and applicationId for pageLayoutWidget and pageLayoutTab',
})
export class BackfillPageLayoutUniversalIdentifiersCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(PageLayoutWidgetEntity)
    private readonly pageLayoutWidgetRepository: Repository<PageLayoutWidgetEntity>,
    @InjectRepository(PageLayoutTabEntity)
    private readonly pageLayoutTabRepository: Repository<PageLayoutTabEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Starting backfill of universalIdentifier and applicationId for workspace ${workspaceId}`,
    );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const applicationId = workspaceCustomFlatApplication.id;

    const widgetsToUpdate = await this.pageLayoutWidgetRepository.find({
      where: [
        { workspaceId, universalIdentifier: IsNull() },
        { workspaceId, applicationId: IsNull() },
      ],
      select: ['id', 'workspaceId'],
    });

    this.logger.log(
      `Found ${widgetsToUpdate.length} pageLayoutWidget records to backfill`,
    );

    for (const widget of widgetsToUpdate) {
      const universalIdentifier = v4();

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would update pageLayoutWidget ${widget.id} with universalIdentifier ${universalIdentifier} and applicationId ${applicationId}`,
        );
      } else {
        await this.pageLayoutWidgetRepository.update(
          { id: widget.id },
          {
            universalIdentifier,
            applicationId,
          },
        );

        this.logger.log(
          `Updated pageLayoutWidget ${widget.id} with universalIdentifier ${universalIdentifier}`,
        );
      }
    }

    const tabsToUpdate = await this.pageLayoutTabRepository.find({
      where: [
        { workspaceId, universalIdentifier: IsNull() },
        { workspaceId, applicationId: IsNull() },
      ],
      select: ['id', 'workspaceId'],
    });

    this.logger.log(
      `Found ${tabsToUpdate.length} pageLayoutTab records to backfill`,
    );

    for (const tab of tabsToUpdate) {
      const universalIdentifier = v4();

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would update pageLayoutTab ${tab.id} with universalIdentifier ${universalIdentifier} and applicationId ${applicationId}`,
        );
      } else {
        await this.pageLayoutTabRepository.update(
          { id: tab.id },
          {
            universalIdentifier,
            applicationId,
          },
        );

        this.logger.log(
          `Updated pageLayoutTab ${tab.id} with universalIdentifier ${universalIdentifier}`,
        );
      }
    }

    if (
      !options.dryRun &&
      (tabsToUpdate.length > 0 || widgetsToUpdate.length > 0)
    ) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatPageLayoutTabMaps',
        'flatPageLayoutWidgetMaps',
      ]);
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] Would have ' : ''}Successfully backfilled ${widgetsToUpdate.length} widgets and ${tabsToUpdate.length} tabs`,
    );
  }
}
