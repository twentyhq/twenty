import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';
import { DataSource } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Command({
  name: 'upgrade:1-20:migrate-rich-text-to-text',
  description:
    'Migrate deprecated RICH_TEXT (V1) to TEXT and rename RICH_TEXT_V2 to RICH_TEXT. The underlying column type is already text, so only the metadata needs updating.',
})
export class MigrateRichTextToTextCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isMigrated = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_RICH_TEXT_V1_MIGRATED,
      workspaceId,
    );

    if (isMigrated) {
      this.logger.log(
        `Rich text migration already completed for workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const dryRun = options?.dryRun ?? false;

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would update RICH_TEXT -> TEXT and RICH_TEXT_V2 -> RICH_TEXT in core.fieldMetadata for workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    this.logger.log(`Migrating RICH_TEXT fields in workspace ${workspaceId}`);

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const v1Result = await queryRunner.query(
        `UPDATE core."fieldMetadata"
         SET "type" = 'TEXT'
         WHERE "workspaceId" = $1
           AND "type" = 'RICH_TEXT'
         RETURNING "id"`,
        [workspaceId],
      );

      const v1Count = v1Result.length;

      const renameResult = await queryRunner.query(
        `UPDATE core."fieldMetadata"
         SET "type" = 'RICH_TEXT'
         WHERE "workspaceId" = $1
           AND "type" = 'RICH_TEXT_V2'
         RETURNING "id"`,
        [workspaceId],
      );

      const renameCount = renameResult.length;

      await queryRunner.commitTransaction();

      if (v1Count > 0) {
        this.logger.log(
          `Migrated ${v1Count} RICH_TEXT (V1) field(s) to TEXT in workspace ${workspaceId}`,
        );
      }

      if (renameCount > 0) {
        this.logger.log(
          `Renamed ${renameCount} RICH_TEXT_V2 field(s) to RICH_TEXT in workspace ${workspaceId}`,
        );
      }

      await this.featureFlagService.enableFeatureFlags(
        [FeatureFlagKey.IS_RICH_TEXT_V1_MIGRATED],
        workspaceId,
      );

      if (v1Count > 0 || renameCount > 0) {
        await this.invalidateCaches(workspaceId);
      } else {
        this.logger.log(
          `No RICH_TEXT or RICH_TEXT_V2 fields found in workspace ${workspaceId}`,
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
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
      'featureFlagsMap',
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
