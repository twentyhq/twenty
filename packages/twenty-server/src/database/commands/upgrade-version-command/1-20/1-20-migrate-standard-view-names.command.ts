import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Command({
  name: 'upgrade:1-20:migrate-standard-view-names',
  description: 'Migrate standard view names to use dynamic templates',
})
export class MigrateStandardViewNamesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Migrating standard view names for workspace ${workspaceId}`,
    );

    const isFeatureFlagAlreadyEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_STANDARD_VIEW_NAME_MIGRATED,
        workspaceId,
      );

    if (isFeatureFlagAlreadyEnabled) {
      this.logger.log(
        `IS_STANDARD_VIEW_NAME_MIGRATED already enabled for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (!isDefined(dataSource)) {
      this.logger.warn(
        `No data source found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would migrate standard view names for workspace ${workspaceId}`,
      );

      return;
    }

    try {
      const migratedViews = await dataSource.query(
        `UPDATE "core"."view"
         SET "name" = 'All {objectLabelPlural}'
         WHERE "name" LIKE 'All %'
         AND "name" NOT LIKE '%{%'
         AND "type" = 'TABLE'
         RETURNING "id"`,
        [],
        undefined,
        { shouldBypassPermissionChecks: true },
      );

      const migratedViewsCount = migratedViews.length;

      this.logger.log(
        `Migrated ${migratedViewsCount} standard view(s) in workspace ${workspaceId}`,
      );

      await this.featureFlagService.enableFeatureFlags(
        [
          FeatureFlagKey.IS_STANDARD_VIEW_NAME_MIGRATED,
          FeatureFlagKey.IS_STANDARD_VIEW_NAME_DYNAMIC_ENABLED,
        ],
        workspaceId,
      );

      const cacheKeysToInvalidate: WorkspaceCacheKeyName[] = ['flatViewMaps'];

      await this.workspaceCacheService.invalidateAndRecompute(
        workspaceId,
        cacheKeysToInvalidate,
      );

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );

      await this.workspaceCacheStorageService.flush(workspaceId);

      this.logger.log(
        `Enabled standard view name feature flags and refreshed caches for workspace ${workspaceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to migrate workspace ${workspaceId}: ${error.message}`,
      );

      throw error;
    }
  }
}
