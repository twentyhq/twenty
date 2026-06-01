import { Command } from 'nest-commander';

import { InjectRepository } from '@nestjs/typeorm';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v4 as uuidv4 } from 'uuid';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

// 2-8 dropped calendarChannel/messageChannel/messageFolder standard objects, which
// cascade-deleted the relation field metadata that owned the join columns on the
// surviving association objects. The physical columns + their data survived, but the
// replacement standard scalar field metadata was never created for existing workspaces,
// so TwentyORM builds the association entity without the join field and every calendar /
// message import crashes with `Property "<channel>Id" was not found`.
// This re-registers the scalar field metadata over the existing physical columns.
type ScalarFieldToRestore = {
  objectUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
  fieldName: string;
  label: string;
  description: string;
  icon: string;
  isNullable: boolean;
};

const SCALAR_FIELDS_TO_RESTORE: ScalarFieldToRestore[] = [
  {
    objectUniversalIdentifier: '20202020-491b-4aaa-9825-afd1bae6ae00',
    fieldUniversalIdentifier: '20202020-93ee-4da4-8d58-0282c4a9cb7d',
    fieldName: 'calendarChannelId',
    label: 'Channel ID',
    description: 'Channel ID',
    icon: 'IconCalendar',
    isNullable: false,
  },
  {
    objectUniversalIdentifier: '20202020-ad1e-4127-bccb-d83ae04d2ccb',
    fieldUniversalIdentifier: '20202020-b658-408f-bd46-3bd2d15d7e52',
    fieldName: 'messageChannelId',
    label: 'Message Channel Id',
    description: 'Message Channel Id',
    icon: 'IconHash',
    isNullable: true,
  },
  {
    objectUniversalIdentifier: '20202020-a1b0-40b0-8ab0-5b6c7d8e9f0a',
    fieldUniversalIdentifier: 'b3369d31-3856-4a7a-b007-ee353918127c',
    fieldName: 'messageFolderId',
    label: 'Message Folder',
    description: 'Message Folder',
    icon: 'IconFolder',
    isNullable: false,
  },
];

@RegisteredWorkspaceCommand('2.8.0', 1798100020000)
@Command({
  name: 'upgrade:2-8:restore-channel-association-scalar-field-metadata',
  description:
    'Re-register the calendarChannelId/messageChannelId/messageFolderId scalar field metadata on the surviving association objects, over their already-existing physical columns, for workspaces where 2-8 drop-channel-standard-objects cascade-removed them',
})
export class RestoreChannelAssociationScalarFieldMetadataCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    // Only fields whose object still exists and whose scalar metadata is absent.
    // For already-healthy workspaces this is empty, so no schema query runs below.
    const candidates = SCALAR_FIELDS_TO_RESTORE.flatMap((fieldToRestore) => {
      const flatObjectMetadata =
        findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier: fieldToRestore.objectUniversalIdentifier,
        });

      if (!isDefined(flatObjectMetadata)) {
        return [];
      }

      const existingFlatFieldMetadata =
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier: fieldToRestore.fieldUniversalIdentifier,
        });

      if (isDefined(existingFlatFieldMetadata)) {
        return [];
      }

      const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata: flatObjectMetadata,
      });

      return [{ fieldToRestore, flatObjectMetadata, schemaName, tableName }];
    });

    if (candidates.length === 0) {
      this.logger.log(
        `No channel association scalar field metadata to restore for workspace ${workspaceId}`,
      );

      return;
    }

    const existingColumnKeys = await this.getExistingColumnKeys({
      dataSource,
      tableColumnPairs: candidates.map(({ tableName, fieldToRestore }) => ({
        tableName,
        columnName: fieldToRestore.fieldName,
      })),
      schemaName: candidates[0].schemaName,
    });

    const fieldMetadataRowsToInsert: QueryDeepPartialEntity<FieldMetadataEntity>[] =
      [];

    for (const {
      fieldToRestore,
      flatObjectMetadata,
      tableName,
    } of candidates) {
      if (!existingColumnKeys.has(`${tableName}.${fieldToRestore.fieldName}`)) {
        this.logger.warn(
          `Physical column ${tableName}.${fieldToRestore.fieldName} missing for workspace ${workspaceId} - skipping metadata-only restore (needs schema repair)`,
        );

        continue;
      }

      fieldMetadataRowsToInsert.push({
        id: uuidv4(),
        universalIdentifier: fieldToRestore.fieldUniversalIdentifier,
        objectMetadataId: flatObjectMetadata.id,
        workspaceId,
        type: FieldMetadataType.UUID,
        name: fieldToRestore.fieldName,
        label: fieldToRestore.label,
        description: fieldToRestore.description,
        icon: fieldToRestore.icon,
        isCustom: false,
        isActive: true,
        isSystem: false,
        isNullable: fieldToRestore.isNullable,
        isUIReadOnly: true,
        isLabelSyncedWithName: false,
      });
    }

    if (fieldMetadataRowsToInsert.length === 0) {
      this.logger.log(
        `No channel association scalar field metadata to restore for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Restoring ${fieldMetadataRowsToInsert.length} scalar field metadata row(s) for workspace ${workspaceId}: ${fieldMetadataRowsToInsert.map((row) => row.name).join(', ')}`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const fieldMetadataRowsWithApplication = fieldMetadataRowsToInsert.map(
      (row) => ({
        ...row,
        applicationId: twentyStandardFlatApplication.id,
      }),
    );

    await this.fieldMetadataRepository.insert(fieldMetadataRowsWithApplication);

    // Derive the affected cache keys from the fieldMetadata metadata name using
    // the same utility set the migration runner uses, so the flush scope stays
    // in sync with the canonical dependency graph automatically.
    const fieldMetadataRelatedNames = [
      'fieldMetadata',
      ...getMetadataRelatedMetadataNames('fieldMetadata'),
      ...getMetadataSerializedRelationNames('fieldMetadata'),
    ] as const;
    const cacheKeysToFlush = [
      ...new Set(fieldMetadataRelatedNames.map(getMetadataFlatEntityMapsKey)),
    ];

    await this.workspaceCacheService.flush(workspaceId, [
      ...cacheKeysToFlush,
      'ORMEntityMetadatas',
      'graphQLResolverNameMap',
    ]);

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    this.logger.log(
      `Restored ${fieldMetadataRowsWithApplication.length} scalar field metadata row(s) for workspace ${workspaceId}`,
    );
  }

  // Single information_schema lookup for all candidate columns in the workspace
  // schema. Returns a set of `tableName.columnName` keys that physically exist.
  private async getExistingColumnKeys({
    dataSource,
    schemaName,
    tableColumnPairs,
  }: {
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
    schemaName: string;
    tableColumnPairs: { tableName: string; columnName: string }[];
  }): Promise<Set<string>> {
    const tableNames = [
      ...new Set(tableColumnPairs.map(({ tableName }) => tableName)),
    ];
    const columnNames = [
      ...new Set(tableColumnPairs.map(({ columnName }) => columnName)),
    ];

    // The workspace data source blocks raw query(); use a query runner like sibling
    // upgrade commands do for direct schema access.
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      const rows: { table_name: string; column_name: string }[] =
        await queryRunner.query(
          `SELECT table_name, column_name
           FROM information_schema.columns
           WHERE table_schema = $1
           AND table_name = ANY($2)
           AND column_name = ANY($3)`,
          [schemaName, tableNames, columnNames],
        );

      return new Set(rows.map((row) => `${row.table_name}.${row.column_name}`));
    } finally {
      await queryRunner.release();
    }
  }
}
