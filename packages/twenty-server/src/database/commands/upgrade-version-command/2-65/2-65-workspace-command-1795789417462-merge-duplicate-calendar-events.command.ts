import chunk from 'lodash.chunk';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildCalendarEventDuplicatePairsQuery } from 'src/database/commands/upgrade-version-command/2-65/utils/build-calendar-event-duplicate-pairs-query.util';
import { buildCalendarEventMergeQueries } from 'src/database/commands/upgrade-version-command/2-65/utils/build-calendar-event-merge-queries.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const MERGE_BATCH_KEEPER_COUNT = 500;

const MERGED_REFERENCING_TABLE_NAMES = [
  'calendarChannelEventAssociation',
  'calendarEventParticipant',
  'calendarEventTarget',
];

type DuplicatePair = {
  duplicateId: string;
  keeperId: string;
};

type MergeBatch = {
  duplicateIds: string[];
  keeperIds: string[];
};

type TableColumn = {
  tableName: string;
  columnName: string;
};

@RegisteredWorkspaceCommand('2.65.0', 1795789417462)
@Command({
  name: 'upgrade:2-65:merge-duplicate-calendar-events',
  description:
    'Merge calendar events synced once per channel into one shared event, as calendar sync now does for new events',
})
export class MergeDuplicateCalendarEventsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.warn(
        `Skipping calendar event merge for workspace ${workspaceId}: no workspace data source`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const [tables] = await dataSource.query<
      Array<{
        calendarEvent: string | null;
        calendarChannelEventAssociation: string | null;
        calendarEventParticipant: string | null;
        calendarEventTarget: string | null;
        timelineActivity: string | null;
        recordShare: string | null;
      }>
    >(
      `SELECT
        to_regclass($1) AS "calendarEvent",
        to_regclass($2) AS "calendarChannelEventAssociation",
        to_regclass($3) AS "calendarEventParticipant",
        to_regclass($4) AS "calendarEventTarget",
        to_regclass($5) AS "timelineActivity",
        to_regclass($6) AS "recordShare"`,
      [
        'calendarEvent',
        'calendarChannelEventAssociation',
        'calendarEventParticipant',
        'calendarEventTarget',
        'timelineActivity',
        'recordShare',
      ].map((tableName) => `"${schemaName}"."${tableName}"`),
    );

    if (
      !isDefined(tables?.calendarEvent) ||
      !isDefined(tables.calendarChannelEventAssociation) ||
      !isDefined(tables.calendarEventParticipant)
    ) {
      return;
    }

    const [{ hasChannelsSharingAProvider }] = await dataSource.query<
      Array<{ hasChannelsSharingAProvider: boolean }>
    >(
      `SELECT EXISTS (
        SELECT 1
        FROM core."calendarChannel" calendar_channel
        INNER JOIN core."connectedAccount" connected_account
          ON connected_account."id" = calendar_channel."connectedAccountId"
        WHERE calendar_channel."workspaceId" = $1
          AND connected_account."provider" IN ($2, $3)
        GROUP BY connected_account."provider"
        HAVING COUNT(*) > 1
      ) AS "hasChannelsSharingAProvider"`,
      [
        workspaceId,
        ConnectedAccountProvider.GOOGLE,
        ConnectedAccountProvider.MICROSOFT,
      ],
    );

    if (!hasChannelsSharingAProvider) {
      return;
    }

    const duplicatePairs = await dataSource.query<DuplicatePair[]>(
      buildCalendarEventDuplicatePairsQuery(schemaName),
      [workspaceId],
    );

    if (duplicatePairs.length === 0) {
      return;
    }

    const batches = this.splitIntoBatches(duplicatePairs);

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would merge ${duplicatePairs.length} duplicate calendar events in ${batches.length} batches for workspace ${workspaceId}`,
      );

      return;
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const calendarEventObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.calendarEvent.universalIdentifier,
      });

    if (!isDefined(calendarEventObjectMetadata)) {
      throw new ObjectMetadataException(
        `calendarEvent object metadata not found for workspace ${workspaceId}`,
        ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const referencingColumns = await this.findReferencingColumns({
      dataSource,
      calendarEventTable: tables.calendarEvent,
    });

    const targetColumns = await this.findTargetColumns({
      dataSource,
      tables: [tables.calendarEventTarget, tables.timelineActivity].filter(
        isDefined,
      ),
    });

    const queries = buildCalendarEventMergeQueries({
      schemaName,
      calendarEventTargetColumnNames: isDefined(tables.calendarEventTarget)
        ? this.getColumnNames({
            tableColumns: targetColumns,
            tableName: 'calendarEventTarget',
          })
        : null,
      timelineActivityTargetColumnNames: isDefined(tables.timelineActivity)
        ? this.getColumnNames({
            tableColumns: targetColumns,
            tableName: 'timelineActivity',
          })
        : null,
      hasRecordShareTable: isDefined(tables.recordShare),
      otherReferencingColumns: referencingColumns.filter(
        ({ tableName }) => !MERGED_REFERENCING_TABLE_NAMES.includes(tableName),
      ),
    });

    for (const { duplicateIds, keeperIds } of batches) {
      await dataSource.transaction(async (entityManager) => {
        for (const query of queries) {
          await entityManager.query(query, [
            duplicateIds,
            keeperIds,
            calendarEventObjectMetadata.id,
          ]);
        }
      });
    }

    this.logger.log(
      `Merged ${duplicatePairs.length} duplicate calendar events for workspace ${workspaceId}`,
    );
  }

  private splitIntoBatches(duplicatePairs: DuplicatePair[]): MergeBatch[] {
    const duplicateIdsByKeeperId = new Map<string, string[]>();

    for (const { duplicateId, keeperId } of duplicatePairs) {
      const duplicateIds = duplicateIdsByKeeperId.get(keeperId);

      if (isDefined(duplicateIds)) {
        duplicateIds.push(duplicateId);
      } else {
        duplicateIdsByKeeperId.set(keeperId, [duplicateId]);
      }
    }

    return chunk(
      [...duplicateIdsByKeeperId.entries()],
      MERGE_BATCH_KEEPER_COUNT,
    ).map((keeperGroups) => ({
      duplicateIds: keeperGroups.flatMap(([, duplicateIds]) => duplicateIds),
      keeperIds: keeperGroups.flatMap(([keeperId, duplicateIds]) =>
        duplicateIds.map(() => keeperId),
      ),
    }));
  }

  private async findReferencingColumns({
    dataSource,
    calendarEventTable,
  }: {
    dataSource: DataSource;
    calendarEventTable: string;
  }): Promise<TableColumn[]> {
    return dataSource.query<TableColumn[]>(
      `SELECT
        referencing_table.relname AS "tableName",
        referencing_column.attname AS "columnName"
      FROM pg_constraint foreign_key
      INNER JOIN pg_class referencing_table
        ON referencing_table.oid = foreign_key.conrelid
      INNER JOIN pg_attribute referencing_column
        ON referencing_column.attrelid = foreign_key.conrelid
        AND referencing_column.attnum = foreign_key.conkey[1]
      WHERE foreign_key.contype = 'f'
        AND foreign_key.confrelid = $1::regclass
        AND cardinality(foreign_key.conkey) = 1`,
      [calendarEventTable],
    );
  }

  private async findTargetColumns({
    dataSource,
    tables,
  }: {
    dataSource: DataSource;
    tables: string[];
  }): Promise<TableColumn[]> {
    if (tables.length === 0) {
      return [];
    }

    return dataSource.query<TableColumn[]>(
      `SELECT
        target_table.relname AS "tableName",
        target_column.attname AS "columnName"
      FROM pg_attribute target_column
      INNER JOIN pg_class target_table
        ON target_table.oid = target_column.attrelid
      WHERE target_column.attrelid = ANY($1::regclass[])
        AND target_column.attnum > 0
        AND NOT target_column.attisdropped
        AND target_column.attname LIKE 'target%Id'
      ORDER BY target_column.attnum`,
      [tables],
    );
  }

  private getColumnNames({
    tableColumns,
    tableName,
  }: {
    tableColumns: TableColumn[];
    tableName: string;
  }): string[] {
    return tableColumns
      .filter((tableColumn) => tableColumn.tableName === tableName)
      .map(({ columnName }) => columnName);
  }
}
