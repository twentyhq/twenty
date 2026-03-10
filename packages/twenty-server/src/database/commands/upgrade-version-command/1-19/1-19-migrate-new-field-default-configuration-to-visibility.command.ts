import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Command({
  name: 'upgrade:1-19:migrate-new-field-default-configuration-to-visibility',
  description:
    'Migrate pageLayoutWidget FIELDS configurations from newFieldDefaultConfiguration to newFieldDefaultVisibility',
})
export class MigrateNewFieldDefaultConfigurationToVisibilityCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Migrating newFieldDefaultConfiguration to newFieldDefaultVisibility for workspace ${workspaceId}`,
    );

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const widgets = await queryRunner.query(
        `SELECT id, configuration
         FROM core."pageLayoutWidget"
         WHERE "workspaceId" = $1
           AND "deletedAt" IS NULL
           AND configuration->>'configurationType' = 'FIELDS'
           AND configuration ? 'newFieldDefaultConfiguration'`,
        [workspaceId],
      );

      if (widgets.length === 0) {
        this.logger.log(`No widgets to migrate for workspace ${workspaceId}`);

        return;
      }

      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Found ${widgets.length} widget(s) to migrate for workspace ${workspaceId}`,
      );

      if (isDryRun) {
        return;
      }

      for (const widget of widgets) {
        const configuration = widget.configuration;
        const isVisible =
          configuration.newFieldDefaultConfiguration?.isVisible ?? true;

        const newConfiguration = { ...configuration };

        delete newConfiguration.newFieldDefaultConfiguration;
        newConfiguration.newFieldDefaultVisibility = isVisible;

        await queryRunner.query(
          `UPDATE core."pageLayoutWidget"
           SET configuration = $1
           WHERE id = $2`,
          [JSON.stringify(newConfiguration), widget.id],
        );
      }

      this.logger.log(
        `Successfully migrated ${widgets.length} widget(s) for workspace ${workspaceId}`,
      );

      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatPageLayoutWidgetMaps',
      ]);

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );

      await this.workspaceCacheStorageService.flush(workspaceId);

      this.logger.log(
        `Cache invalidated and metadata version incremented for workspace ${workspaceId}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
