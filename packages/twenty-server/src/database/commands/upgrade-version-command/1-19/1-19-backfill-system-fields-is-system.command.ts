import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { PARTIAL_SYSTEM_FLAT_FIELD_METADATAS } from 'src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

const SYSTEM_FIELD_NAMES = Object.keys(PARTIAL_SYSTEM_FLAT_FIELD_METADATAS);

const POSITION_FIELDS_TO_FIX_TYPE = [
  STANDARD_OBJECTS.favorite.fields.position.universalIdentifier,
  STANDARD_OBJECTS.favoriteFolder.fields.position.universalIdentifier,
];

const RELATION_FIELD_TYPES = [
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
];

@Command({
  name: 'upgrade:1-19:backfill-system-fields-is-system',
  description:
    'Set isSystem to true for system field names, set isSystem to false for relation/morph_relation fields, and fix position field type for favorite/favoriteFolder',
})
export class BackfillSystemFieldsIsSystemCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
      `${dryRun ? '[DRY RUN] ' : ''}Backfilling isSystem for system fields in workspace ${workspaceId}`,
    );

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would set isSystem=true for fields named [${SYSTEM_FIELD_NAMES.join(', ')}], set isSystem=false for relation fields, and fix position field types in workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      let needsCacheInvalidation = false;

      const isSystemResult = await queryRunner.query(
        `UPDATE core."fieldMetadata"
         SET "isSystem" = true
         WHERE "workspaceId" = $1
           AND "name" = ANY($2)
           AND "isSystem" = false`,
        [workspaceId, SYSTEM_FIELD_NAMES],
      );

      const isSystemUpdatedCount = isSystemResult?.[1] ?? 0;

      if (isSystemUpdatedCount > 0) {
        this.logger.log(
          `Set isSystem=true for ${isSystemUpdatedCount} field(s) in workspace ${workspaceId}`,
        );
        needsCacheInvalidation = true;
      }

      const relationIsSystemResult = await queryRunner.query(
        `UPDATE core."fieldMetadata"
         SET "isSystem" = false
         WHERE "workspaceId" = $1
           AND "type" = ANY($2)
           AND "isSystem" = true`,
        [workspaceId, RELATION_FIELD_TYPES],
      );

      const relationIsSystemUpdatedCount = relationIsSystemResult?.[1] ?? 0;

      if (relationIsSystemUpdatedCount > 0) {
        this.logger.log(
          `Set isSystem=false for ${relationIsSystemUpdatedCount} relation field(s) in workspace ${workspaceId}`,
        );
        needsCacheInvalidation = true;
      }

      const positionTypeResult = await queryRunner.query(
        `UPDATE core."fieldMetadata"
         SET "type" = $1
         WHERE "workspaceId" = $2
           AND "universalIdentifier" = ANY($3)
           AND "type" = $4`,
        [
          FieldMetadataType.POSITION,
          workspaceId,
          POSITION_FIELDS_TO_FIX_TYPE,
          FieldMetadataType.NUMBER,
        ],
      );

      const positionTypeUpdatedCount = positionTypeResult?.[1] ?? 0;

      if (positionTypeUpdatedCount > 0) {
        this.logger.log(
          `Fixed type from NUMBER to POSITION for ${positionTypeUpdatedCount} field(s) in workspace ${workspaceId}`,
        );
        needsCacheInvalidation = true;
      }

      if (needsCacheInvalidation) {
        await this.invalidateCaches(workspaceId);
      } else {
        this.logger.log(
          `No fields needed updating in workspace ${workspaceId}`,
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
