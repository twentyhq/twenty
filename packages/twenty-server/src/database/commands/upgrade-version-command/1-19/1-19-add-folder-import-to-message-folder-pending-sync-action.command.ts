import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type FieldMetadataComplexOption } from 'twenty-shared/types';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import {
  escapeIdentifier,
  escapeLiteral,
} from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const MESSAGE_FOLDER_PENDING_SYNC_ACTION_ENUM_NAME =
  'messageFolder_pendingSyncAction_enum';
const FOLDER_IMPORT_ENUM_VALUE = 'FOLDER_IMPORT';
const MESSAGE_FOLDER_PENDING_SYNC_ACTION_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageFolder.fields.pendingSyncAction.universalIdentifier;

@Command({
  name: 'upgrade:1-19:add-folder-import-to-message-folder-pending-sync-action',
  description:
    'Add FOLDER_IMPORT to messageFolder.pendingSyncAction enum and metadata options',
})
export class AddFolderImportToMessageFolderPendingSyncActionCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
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
      `${dryRun ? '[DRY RUN] ' : ''}Adding FOLDER_IMPORT to messageFolder.pendingSyncAction in workspace ${workspaceId}`,
    );

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would add FOLDER_IMPORT enum value and field metadata option in workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const schemaName = getWorkspaceSchemaName(workspaceId);
      const rows = await queryRunner.query(
        `SELECT "id", "options"
         FROM core."fieldMetadata"
         WHERE "workspaceId" = $1
           AND "universalIdentifier" = $2
         LIMIT 1`,
        [
          workspaceId,
          MESSAGE_FOLDER_PENDING_SYNC_ACTION_FIELD_UNIVERSAL_IDENTIFIER,
        ],
      );

      const fieldMetadata = rows[0];

      if (!fieldMetadata) {
        this.logger.warn(
          `pendingSyncAction field metadata not found for workspace ${workspaceId}, skipping upgrade`,
        );

        return;
      }

      const currentOptions: FieldMetadataComplexOption[] = Array.isArray(
        fieldMetadata.options,
      )
        ? fieldMetadata.options
        : [];

      const alreadyHasFolderImport = currentOptions.some(
        (option) => option?.value === FOLDER_IMPORT_ENUM_VALUE,
      );

      if (alreadyHasFolderImport) {
        this.logger.log(
          `FOLDER_IMPORT already present for workspace ${workspaceId}`,
        );

        return;
      }

      await queryRunner.query(
        `ALTER TYPE ${escapeIdentifier(schemaName)}.${escapeIdentifier(MESSAGE_FOLDER_PENDING_SYNC_ACTION_ENUM_NAME)} ADD VALUE IF NOT EXISTS ${escapeLiteral(FOLDER_IMPORT_ENUM_VALUE)}`,
      );

      const folderImportOption =
        await this.getFolderImportOptionFromStandardMetadata(workspaceId);

      const maxPosition = currentOptions.reduce(
        (max, option) =>
          Math.max(
            max,
            typeof option?.position === 'number' ? option.position : 0,
          ),
        0,
      );

      const updatedOptions: FieldMetadataComplexOption[] = [
        ...currentOptions,
        { ...folderImportOption, position: maxPosition + 1 },
      ];

      await queryRunner.query(
        `UPDATE core."fieldMetadata"
         SET "options" = $1::jsonb
         WHERE "id" = $2`,
        [JSON.stringify(updatedOptions), fieldMetadata.id],
      );

      this.logger.log(
        `Added FOLDER_IMPORT option to field metadata for workspace ${workspaceId}`,
      );

      await this.invalidateCaches(workspaceId);
    } finally {
      await queryRunner.release();
    }
  }

  private async getFolderImportOptionFromStandardMetadata(
    workspaceId: string,
  ): Promise<FieldMetadataComplexOption> {
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const standardField = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
      universalIdentifier:
        MESSAGE_FOLDER_PENDING_SYNC_ACTION_FIELD_UNIVERSAL_IDENTIFIER,
    });

    const folderImportOption = (
      standardField.options as FieldMetadataComplexOption[]
    )?.find((option) => option.value === FOLDER_IMPORT_ENUM_VALUE);

    if (!folderImportOption) {
      throw new Error(
        `FOLDER_IMPORT option not found in standard metadata for workspace ${workspaceId}`,
      );
    }

    return folderImportOption;
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
