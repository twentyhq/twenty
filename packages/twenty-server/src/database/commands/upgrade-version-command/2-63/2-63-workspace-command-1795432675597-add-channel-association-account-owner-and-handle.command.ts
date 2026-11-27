import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MessageChannelType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  WorkspaceSchemaManagerException,
  WorkspaceSchemaManagerExceptionCode,
} from 'src/engine/twenty-orm/workspace-schema-manager/exceptions/workspace-schema-manager.exception';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

// Each batch commits on its own so a large mailbox never holds every row lock at once
const BACKFILL_BATCH_SIZE = 5000;

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

const ACCOUNT_OWNER_JOIN_COLUMN_NAME = 'accountOwnerId';

const CHANNEL_ASSOCIATIONS = [
  {
    standardObject: STANDARD_OBJECTS.calendarChannelEventAssociation,
    channelIdColumnName: 'calendarChannelId',
    coreChannelTableName: 'calendarChannel',
    channelTypeColumnSql: 'NULL::text',
  },
  {
    standardObject: STANDARD_OBJECTS.messageChannelMessageAssociation,
    channelIdColumnName: 'messageChannelId',
    coreChannelTableName: 'messageChannel',
    channelTypeColumnSql: 'channel."type"',
  },
] as const;

type ChannelAssociation = (typeof CHANNEL_ASSOCIATIONS)[number];

type BackfillBatchResult = { lastId: string | null; updatedCount: number };

const FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.calendarChannelEventAssociation.fields.accountOwner
    .universalIdentifier,
  STANDARD_OBJECTS.calendarChannelEventAssociation.fields.handle
    .universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.accountOwner
    .universalIdentifier,
  STANDARD_OBJECTS.messageChannelMessageAssociation.fields.handle
    .universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields
    .accountOwnerForCalendarChannelEventAssociations.universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields
    .accountOwnerForMessageChannelMessageAssociations.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.63.0', 1795432675597)
@Command({
  name: 'upgrade:2-63:add-channel-association-account-owner-and-handle',
  description:
    'Add the account owner relation and the channel handle to calendar and message channel associations and backfill them from each channel',
})
export class AddChannelAssociationAccountOwnerAndHandleCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const missingObjectUniversalIdentifier = [
      STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier,
      STANDARD_OBJECTS.messageChannelMessageAssociation.universalIdentifier,
      STANDARD_OBJECTS.workspaceMember.universalIdentifier,
    ].find(
      (objectUniversalIdentifier) =>
        !isDefined(
          flatObjectMetadataMaps.byUniversalIdentifier[
            objectUniversalIdentifier
          ],
        ),
    );

    if (isDefined(missingObjectUniversalIdentifier)) {
      this.logger.warn(
        `Object ${missingObjectUniversalIdentifier} not found for workspace ${workspaceId}, skipping account owner and handle creation`,
      );

      return;
    }

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

    const fieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        existingFlatEntityMaps: flatFieldMetadataMaps,
        universalIdentifiers: FIELD_UNIVERSAL_IDENTIFIERS,
      });
    const indexesToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
        existingFlatEntityMaps: flatIndexMaps,
        universalIdentifiers: CHANNEL_ASSOCIATIONS.map(
          ({ standardObject }) =>
            standardObject.indexes.accountOwnerIdIndex.universalIdentifier,
        ),
      });

    if (fieldsToCreate.length === 0 && indexesToCreate.length === 0) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would create ${fieldsToCreate.length} field(s), backfill and index ${indexesToCreate.length} channel association table(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const applicationUniversalIdentifier =
      twentyStandardFlatApplication.universalIdentifier;

    if (fieldsToCreate.length > 0) {
      await this.runMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: fieldsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
      });
    }

    for (const channelAssociation of CHANNEL_ASSOCIATIONS) {
      const indexToCreate = indexesToCreate.find(
        ({ universalIdentifier }) =>
          universalIdentifier ===
          channelAssociation.standardObject.indexes.accountOwnerIdIndex
            .universalIdentifier,
      );

      if (!isDefined(indexToCreate)) {
        continue;
      }

      const flatObjectMetadata =
        findFlatEntityByUniversalIdentifierOrThrow<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier:
            channelAssociation.standardObject.universalIdentifier,
        });

      const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata: flatObjectMetadata,
      });

      await this.backfillAssociationSources({
        workspaceId,
        schemaName,
        tableName,
        channelAssociation,
      });

      await this.createIndexConcurrently({
        workspaceId,
        schemaName,
        tableName,
        indexToCreate,
      });
    }

    if (indexesToCreate.length > 0) {
      await this.runMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          index: {
            flatEntityToCreate: indexesToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
      });
    }

    this.logger.log(
      `Created ${fieldsToCreate.length} field(s) and ${indexesToCreate.length} index(es) for workspace ${workspaceId}`,
    );
  }

  private async backfillAssociationSources({
    workspaceId,
    schemaName,
    tableName,
    channelAssociation: {
      channelIdColumnName,
      coreChannelTableName,
      channelTypeColumnSql,
    },
  }: {
    workspaceId: string;
    schemaName: string;
    tableName: string;
    channelAssociation: Pick<
      ChannelAssociation,
      'channelIdColumnName' | 'coreChannelTableName' | 'channelTypeColumnSql'
    >;
  }): Promise<void> {
    // A member who left and rejoined keeps a soft-deleted row beside the live one
    const channelSources = await this.dataSource.query<
      {
        channelId: string;
        handle: string;
        accountOwnerId: string | null;
      }[]
    >(
      `SELECT channel.id AS "channelId", channel.handle AS "handle",
         CASE WHEN ${channelTypeColumnSql} = $2 THEN NULL ELSE member.id END AS "accountOwnerId"
       FROM core.${escapeIdentifier(coreChannelTableName)} channel
       JOIN core."connectedAccount" account ON account.id = channel."connectedAccountId"
       LEFT JOIN core."userWorkspace" "userWorkspace" ON "userWorkspace".id = account."userWorkspaceId"
       LEFT JOIN ${escapeIdentifier(schemaName)}."workspaceMember" member
         ON member."userId" = "userWorkspace"."userId" AND member."deletedAt" IS NULL
       WHERE channel."workspaceId" = $1`,
      [workspaceId, MessageChannelType.EMAIL_GROUP],
    );

    if (channelSources.length === 0) {
      return;
    }

    const associationTable = `${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`;
    const channelIdColumn = escapeIdentifier(channelIdColumnName);
    let lastId: string | null = NIL_UUID;
    let updatedCount = 0;

    while (isDefined(lastId)) {
      const [batchResult]: BackfillBatchResult[] = await this.dataSource.query(
        `WITH batch AS (
           SELECT id FROM ${associationTable}
           WHERE id > $1
           ORDER BY id
           LIMIT ${BACKFILL_BATCH_SIZE}
         ), source AS (
           SELECT * FROM unnest($2::uuid[], $3::text[], $4::uuid[])
             AS source("channelId", "handle", "accountOwnerId")
         ), updated AS (
           UPDATE ${associationTable} association
           SET "accountOwnerId" = source."accountOwnerId", "handle" = source."handle"
           FROM batch, source
           WHERE association.id = batch.id
             AND association.${channelIdColumn} = source."channelId"
             AND association."handle" IS NULL
           RETURNING 1
         )
         SELECT
           (SELECT id FROM batch ORDER BY id DESC LIMIT 1) AS "lastId",
           (SELECT count(*) FROM updated)::int AS "updatedCount"`,
        [
          lastId,
          channelSources.map(({ channelId }) => channelId),
          channelSources.map(({ handle }) => handle),
          channelSources.map(({ accountOwnerId }) => accountOwnerId),
        ],
      );

      lastId = batchResult.lastId;
      updatedCount += batchResult.updatedCount;
    }

    this.logger.log(
      `Workspace ${workspaceId}: backfilled the account owner and handle of ${updatedCount} ${tableName} row(s)`,
    );
  }

  private async createIndexConcurrently({
    workspaceId,
    schemaName,
    tableName,
    indexToCreate,
  }: {
    workspaceId: string;
    schemaName: string;
    tableName: string;
    indexToCreate: FlatIndexMetadata;
  }): Promise<void> {
    if (this.dataSource.options.type !== 'postgres') {
      throw new WorkspaceSchemaManagerException(
        `Concurrent index builds need a postgres datasource, got ${this.dataSource.options.type}`,
        WorkspaceSchemaManagerExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    // A concurrent build can outlast the core pool's query timeout, so it gets its own connection
    const indexBuildDataSource = await new DataSource({
      ...this.dataSource.options,
      entities: [],
      migrations: [],
      subscribers: [],
      poolSize: 1,
      extra: {
        ...this.dataSource.options.extra,
        query_timeout: undefined,
        statement_timeout: undefined,
      },
    }).initialize();

    try {
      const queryRunner = indexBuildDataSource.createQueryRunner();

      await queryRunner.connect();

      const invalidIndexes: { name: string }[] = await queryRunner.query(
        `SELECT c.relname AS name
         FROM pg_index i
         JOIN pg_class c ON c.oid = i.indexrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1 AND c.relname = $2 AND NOT i.indisvalid`,
        [schemaName, indexToCreate.name],
      );

      for (const { name } of invalidIndexes) {
        await this.workspaceSchemaManagerService.indexManager.dropIndex({
          queryRunner,
          schemaName,
          indexName: name,
          concurrently: true,
        });

        this.logger.warn(
          `Dropped invalid index ${name} left by an interrupted build in workspace ${workspaceId}, recreating it`,
        );
      }

      await this.workspaceSchemaManagerService.indexManager.createIndex({
        queryRunner,
        schemaName,
        tableName,
        index: {
          name: indexToCreate.name,
          columns: [ACCOUNT_OWNER_JOIN_COLUMN_NAME],
          isUnique: indexToCreate.isUnique,
          type: indexToCreate.indexType,
          where: indexToCreate.indexWhereClause ?? undefined,
        },
        concurrently: true,
      });
    } finally {
      await indexBuildDataSource.destroy();
    }
  }

  private async runMigration({
    workspaceId,
    applicationUniversalIdentifier,
    allFlatEntityOperationByMetadataName,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    allFlatEntityOperationByMetadataName: AllFlatEntityOperationByMetadataName;
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          isSystemBuild: true,
          applicationUniversalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName,
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
