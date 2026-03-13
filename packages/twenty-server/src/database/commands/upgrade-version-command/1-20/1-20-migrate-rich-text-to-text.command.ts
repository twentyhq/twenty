import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Command({
  name: 'upgrade:1-20:migrate-rich-text-to-text',
  description:
    'Migrate deprecated RICH_TEXT field metadata type to TEXT. The underlying column type is already text, so only the metadata needs updating.',
})
export class MigrateRichTextToTextCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
    const dryRun = options?.dryRun ?? false;

    this.logger.log(
      `${dryRun ? '[DRY RUN] ' : ''}Migrating RICH_TEXT fields to TEXT in workspace ${workspaceId}`,
    );

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would update RICH_TEXT -> TEXT in core.fieldMetadata for workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const result = await queryRunner.query(
        `UPDATE core."fieldMetadata"
         SET "type" = 'TEXT'
         WHERE "workspaceId" = $1
           AND "type" = 'RICH_TEXT'
         RETURNING "id"`,
        [workspaceId],
      );

      const updatedCount = result.length;

      if (updatedCount > 0) {
        this.logger.log(
          `Migrated ${updatedCount} RICH_TEXT field(s) to TEXT in workspace ${workspaceId}`,
        );
        await this.invalidateCaches(workspaceId);
      } else {
        this.logger.log(
          `No RICH_TEXT fields found in workspace ${workspaceId}`,
        );
      }
    } finally {
      await queryRunner.release();
    }
  }

  private async invalidateCaches(workspaceId: string): Promise<void> {
    const modifiedMetadataNames = ['fieldMetadata'] as const;

    const cacheKeysToInvalidate: WorkspaceCacheKeyName[] = [
      ...new Set(
        modifiedMetadataNames
          .flatMap((name) => [name, ...getMetadataRelatedMetadataNames(name)])
          .map(getMetadataFlatEntityMapsKey),
      ),
      'ORMEntityMetadatas',
    ];

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      cacheKeysToInvalidate,
    );

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    await this.workspaceCacheStorageService.flush(workspaceId);

    this.logger.log(
      `Cache invalidated and metadata version incremented for workspace ${workspaceId}`,
    );
  }
}
