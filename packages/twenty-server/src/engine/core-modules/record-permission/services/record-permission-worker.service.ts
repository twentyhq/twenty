import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { scheduleRecordPermissionReconciliation } from 'src/engine/core-modules/record-permission/utils/schedule-record-permission-reconciliation.util';
import { readRecordPermissionScanBatch } from 'src/engine/core-modules/record-permission/utils/read-record-permission-scan-batch.util';
import { enrollRecordPermissionMetadata } from 'src/engine/core-modules/record-permission/utils/enroll-record-permission-metadata.util';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { setTimeout as delay } from 'node:timers/promises';

import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { RecordPermissionPolicyService } from 'src/engine/core-modules/record-permission/services/record-permission-policy.service';
import {
  type RecordPermissionAccessGroup,
  type RecordPermissionContext,
} from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { type RecordPermissionDatabase } from 'src/engine/core-modules/record-permission/types/record-permission-database.type';
import { recomputeRecordPermissionBatch } from 'src/engine/core-modules/record-permission/utils/recompute-record-permission-batch.util';
import { resolveRecordPermissionPath } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-path.util';
import { RecordPermissionRevisionEntity } from 'src/engine/metadata-modules/record-permissions/entities/record-permission-revision.entity';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const MAX_BATCH_SIZE = 1000;
const WORK_WINDOW_MS = 5000;

@Injectable()
export class RecordPermissionWorkerService {
  private readonly logger = new Logger(RecordPermissionWorkerService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly policyService: RecordPermissionPolicyService,
  ) {}

  async drain(workspaceId: string): Promise<boolean> {
    let remaining = false;
    const revisions = await this.dataSource
      .getRepository(RecordPermissionRevisionEntity)
      .find({
        where: [
          { workspaceId, status: 'active' },
          { workspaceId, status: 'building' },
        ],
        order: { createdAt: 'ASC' },
      });

    for (const revision of revisions) {
      try {
        if (revision.status === 'active') {
          const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
          const [{ pending }] = await this.dataSource.query(
            `SELECT EXISTS (SELECT 1 FROM ${schema}."recordPermissionWork") OR EXISTS (SELECT 1 FROM ${schema}."recordPermissionExpansion") OR EXISTS (SELECT 1 FROM ${schema}."recordPermissionScan" WHERE NOT complete) OR EXISTS (SELECT 1 FROM ${schema}."recordPermissionAccessGroup" WHERE "revisionId" <> $1 AND NOT EXISTS (SELECT 1 FROM ${schema}."recordPermissionState" WHERE "candidateRevisionId" = "recordPermissionAccessGroup"."revisionId")) AS pending`,
            [revision.id],
          );
          if (!pending) continue;
        }
        const context = await this.policyService.loadContext(
          workspaceId,
          revision,
        );
        await enrollRecordPermissionMetadata({
          dataSource: this.dataSource,
          workspaceId,
          metadata: context,
          schemaName: context.schemaName,
        });
        const [{ bindingGeneration }] = await this.dataSource.query(
          `SELECT "bindingGeneration" FROM ${escapeIdentifier(context.schemaName)}."recordPermissionState" WHERE id`,
        );
        context.bindingGeneration = String(bindingGeneration);
        const groups = await this.policyService.buildAccessGroups(
          workspaceId,
          context,
        );
        const schema = escapeIdentifier(context.schemaName);

        await this.synchronizeGroups(context, groups);
        const projectionQueries = new Map<string, SqlCondition>();
        const startedAt = Date.now();
        let batchSize = MAX_BATCH_SIZE;

        while (Date.now() - startedAt < WORK_WINDOW_MS) {
          const batchStartedAt = Date.now();
          let hadWork: boolean;
          try {
            hadWork = await this.dataSource.transaction(async (manager) => {
              await manager.query("SET LOCAL statement_timeout = '1500ms'");
              await manager.query('SET LOCAL jit = off');
              await manager.query("SET LOCAL lock_timeout = '100ms'");
              const [{ acquired }] = await manager.query(
                'SELECT pg_try_advisory_xact_lock(hashtextextended($1, 0)) AS acquired',
                [context.schemaName + ':record-permission-worker'],
              );

              if (!acquired) return false;
              const backgroundAdmission = await manager.query(
                "SELECT slot FROM generate_series(0, 1) AS slot WHERE pg_try_advisory_xact_lock(hashtextextended('record-permission-background:' || slot::text, 0)) LIMIT 1",
              );

              if (backgroundAdmission.length === 0) return false;
              await manager.query(
                'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))',
                [context.schemaName + ':record-permissions'],
              );
              const [state] = await manager.query(
                `SELECT * FROM ${schema}."recordPermissionState" WHERE id`,
              );

              if (
                ![state.activeRevisionId, state.candidateRevisionId].includes(
                  revision.id,
                ) ||
                String(state.bindingGeneration) !== context.bindingGeneration
              )
                return false;

              return (
                (await this.processInvalidations(
                  manager,
                  context,
                  groups,
                  projectionQueries,
                  batchSize,
                )) ||
                (await this.processExpansion(manager, context, batchSize)) ||
                (await this.processScan(
                  manager,
                  context,
                  groups,
                  projectionQueries,
                  batchSize,
                )) ||
                (await this.cleanRetiredRevisionState(manager, context))
              );
            });
          } catch (error) {
            if (
              error instanceof Error &&
              'code' in error &&
              error.code === '57014' &&
              batchSize > 1
            ) {
              batchSize = Math.max(1, Math.floor(batchSize / 2));
              remaining = true;
              continue;
            }
            throw error;
          }
          if (!hadWork) break;
          await delay(
            Math.max(0, batchSize / 3 - (Date.now() - batchStartedAt)),
          );
          if (Date.now() - batchStartedAt < 250)
            batchSize = Math.min(MAX_BATCH_SIZE, batchSize + 10);
        }

        if (revision.status === 'building') {
          await this.tryActivate(context);
        }
        const [{ pending }] = await this.dataSource.query(
          `SELECT EXISTS (SELECT 1 FROM ${schema}."recordPermissionScan" WHERE "revisionId" = $1 AND NOT complete) OR EXISTS (SELECT 1 FROM ${schema}."recordPermissionWork" WHERE "revisionId" = $1) OR EXISTS (SELECT 1 FROM ${schema}."recordPermissionExpansion" WHERE "revisionId" = $1) AS pending`,
          [revision.id],
        );
        remaining ||= pending;
      } catch (error) {
        const code =
          error instanceof Error && 'code' in error ? error.code : undefined;
        if (
          revision.status === 'building' &&
          !['57014', '55P03', '40001', '40P01', '08006', '57P01'].includes(
            String(code),
          )
        ) {
          await this.dataSource
            .getRepository(RecordPermissionRevisionEntity)
            .update(
              { id: revision.id, status: 'building' },
              {
                status: 'failed',
                failureReason:
                  'Permission calculation failed. Cancel this revision, review its rules, and try again.',
              },
            );
        }
        throw error;
      }
    }
    return remaining;
  }

  async reconcile(workspaceId: string): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);
    await this.dataSource.transaction(async (manager) => {
      await manager.query("SET LOCAL statement_timeout = '1500ms'");
      await manager.query("SET LOCAL lock_timeout = '100ms'");
      const [{ acquired }] = await manager.query(
        'SELECT pg_try_advisory_xact_lock(hashtextextended($1, 0)) AS acquired',
        [schemaName + ':record-permission-worker'],
      );
      if (!acquired) return;
      await manager.query(
        'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))',
        [schemaName + ':record-permissions'],
      );
      await scheduleRecordPermissionReconciliation({
        database: manager,
        schemaName,
      });
    });
  }

  private async synchronizeGroups(
    context: RecordPermissionContext,
    groups: RecordPermissionAccessGroup[],
  ): Promise<void> {
    const schema = escapeIdentifier(context.schemaName);

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))',
        [context.schemaName + ':record-permissions'],
      );
      const existing: { id: string }[] = await manager.query(
        `SELECT id FROM ${schema}."recordPermissionAccessGroup" WHERE "revisionId" = $1`,
        [context.revisionId],
      );
      const existingIds = new Set(existing.map((group) => group.id));
      const added = groups.filter((group) => !existingIds.has(group.id));

      if (added.length > 0) {
        await manager.query(
          `INSERT INTO ${schema}."recordPermissionAccessGroup" (id, "revisionId", definition) SELECT (definition->>'id')::uuid, $1::uuid, definition FROM jsonb_array_elements($2::jsonb) definition ON CONFLICT DO NOTHING`,
          [context.revisionId, JSON.stringify(added)],
        );
      }
      if (added.some((group) => group.sharePrincipalIds === null)) {
        await manager.query(
          `UPDATE ${schema}."recordPermissionScan" SET "blockCursor" = 0, "blockLimit" = NULL, "relationFileNode" = NULL, complete = false, processed = 0 WHERE "revisionId" = $1`,
          [context.revisionId],
        );
      }
    });
  }

  private async processInvalidations(
    database: RecordPermissionDatabase,
    context: RecordPermissionContext,
    groups: RecordPermissionAccessGroup[],
    projectionQueries: Map<string, SqlCondition>,
    batchSize: number,
  ): Promise<boolean> {
    const schema = escapeIdentifier(context.schemaName);
    const work = await database.query(
      `SELECT * FROM ${schema}."recordPermissionWork" WHERE "revisionId" = $1 ORDER BY "createdAt" LIMIT $2`,
      [context.revisionId, batchSize],
    );

    if (work.length === 0) return false;

    const byObject = new Map<string, typeof work>();

    for (const entry of work) {
      const objectId = String(entry.objectMetadataId);
      byObject.set(objectId, [...(byObject.get(objectId) ?? []), entry]);
    }

    for (const [objectMetadataId, entries] of byObject) {
      const object = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: objectMetadataId,
        flatEntityMaps: context.flatObjectMetadataMaps,
      });

      if (isDefined(object)) {
        await recomputeRecordPermissionBatch({
          database,
          context,
          groups,
          projectionQueries,
          objectUniversalIdentifier: object.universalIdentifier,
          recordIds: entries.map((entry) => String(entry.recordId)),
        });
        const currentRecords = await database.query(
          `SELECT * FROM ${schema}.${escapeIdentifier(computeObjectTargetTable(object))} WHERE id = ANY($1::uuid[])`,
          [entries.map((entry) => entry.recordId)],
        );
        const snapshots = [
          ...currentRecords,
          ...entries.flatMap(
            (entry) => entry.snapshots as Record<string, unknown>[],
          ),
        ];

        await this.enqueueDescendants(
          database,
          context,
          object.universalIdentifier,
          snapshots,
        );
        if (
          entries.some((entry) => entry.requiresRebuild) ||
          object.nameSingular === 'workspaceMember'
        ) {
          await database.query(
            `UPDATE ${schema}."recordPermissionScan" SET "blockCursor" = 0, "blockLimit" = NULL, "relationFileNode" = NULL, complete = false, processed = 0 WHERE "revisionId" = $1`,
            [context.revisionId],
          );
        }
      }
      await database.query(
        `DELETE FROM ${schema}."recordPermissionWork" AS work
        USING jsonb_to_recordset($3::jsonb) AS completed("recordId" uuid, generation bigint)
        WHERE work."revisionId" = $1 AND work."objectMetadataId" = $2
          AND work."recordId" = completed."recordId" AND work.generation = completed.generation
          AND EXISTS (SELECT 1 FROM ${schema}."recordPermissionState" WHERE "bindingGeneration" = $4::bigint)`,
        [
          context.revisionId,
          objectMetadataId,
          JSON.stringify(
            entries.map(({ recordId, generation }) => ({
              recordId,
              generation,
            })),
          ),
          context.bindingGeneration,
        ],
      );
    }

    return true;
  }

  private async enqueueDescendants(
    database: RecordPermissionDatabase,
    context: RecordPermissionContext,
    objectUniversalIdentifier: string,
    snapshots: Record<string, unknown>[],
  ): Promise<void> {
    const entries = new Map<string, { fields: string[]; value: string }>();

    for (const object of context.definition.objects) {
      for (const path of object.inheritancePaths) {
        const hops = resolveRecordPermissionPath({
          path,
          targetObjectUniversalIdentifier: object.objectUniversalIdentifier,
          metadata: context,
        });

        for (const [index, hop] of hops.entries()) {
          if (
            hop.sourceObject.universalIdentifier !== objectUniversalIdentifier
          )
            continue;
          const fields = path.fieldUniversalIdentifiers.slice(index);

          for (const snapshot of snapshots) {
            const value = snapshot[hop.sourceColumn];

            if (typeof value === 'string')
              entries.set(JSON.stringify([fields, value]), { fields, value });
          }
        }
      }
    }

    await this.insertExpansions(database, context, [...entries.values()]);
  }

  private async insertExpansions(
    database: RecordPermissionDatabase,
    context: RecordPermissionContext,
    entries: { fields: string[]; value: string }[],
  ): Promise<void> {
    if (entries.length === 0) return;
    await database.query(
      `INSERT INTO ${escapeIdentifier(context.schemaName)}."recordPermissionExpansion" ("revisionId", "fieldUniversalIdentifiers", "lookupValue") SELECT DISTINCT $1::uuid, fields, value FROM jsonb_to_recordset($2::jsonb) AS entry(fields uuid[], value uuid) ON CONFLICT ("revisionId", "fieldUniversalIdentifiers", "lookupValue") DO UPDATE SET cursor = NULL`,
      [context.revisionId, JSON.stringify(entries)],
    );
  }

  private async processExpansion(
    database: RecordPermissionDatabase,
    context: RecordPermissionContext,
    batchSize: number,
  ): Promise<boolean> {
    const schema = escapeIdentifier(context.schemaName);
    const [entry] = await database.query(
      `SELECT * FROM ${schema}."recordPermissionExpansion" WHERE "revisionId" = $1 ORDER BY id LIMIT 1`,
      [context.revisionId],
    );

    if (!isDefined(entry)) return false;
    const fields = entry.fieldUniversalIdentifiers as string[];
    const field =
      context.flatFieldMetadataMaps.byUniversalIdentifier[fields[0]];
    const sourceObject = isDefined(field)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: field.objectMetadataId,
          flatEntityMaps: context.flatObjectMetadataMaps,
        })
      : undefined;
    const targetObject = isDefined(field?.relationTargetObjectMetadataId)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: field.relationTargetObjectMetadataId,
          flatEntityMaps: context.flatObjectMetadataMaps,
        })
      : undefined;

    if (!isDefined(sourceObject) || !isDefined(targetObject))
      throw new Error('An inheritance field changed during propagation');
    const [hop] = resolveRecordPermissionPath({
      metadata: context,
      targetObjectUniversalIdentifier: targetObject.universalIdentifier,
      path: {
        universalIdentifier: fields[0],
        sourceObjectUniversalIdentifier: sourceObject.universalIdentifier,
        fieldUniversalIdentifiers: [fields[0]],
      },
    });
    const records = await database.query(
      `SELECT * FROM ${schema}.${escapeIdentifier(computeObjectTargetTable(targetObject))} WHERE ${escapeIdentifier(hop.targetColumn)} = $1 AND ($2::uuid IS NULL OR id > $2::uuid) ORDER BY id LIMIT $3`,
      [entry.lookupValue, entry.cursor, batchSize],
    );

    if (records.length > 0 && fields.length === 1) {
      await database.query(
        `INSERT INTO ${schema}."recordPermissionWork" ("revisionId", "objectMetadataId", "recordId") SELECT $1::uuid, $2::uuid, unnest($3::uuid[]) ON CONFLICT ("revisionId", "objectMetadataId", "recordId") DO UPDATE SET generation = "recordPermissionWork".generation + 1`,
        [
          context.revisionId,
          targetObject.id,
          records.map((record) => record.id),
        ],
      );
    } else if (records.length > 0) {
      const nextField =
        context.flatFieldMetadataMaps.byUniversalIdentifier[fields[1]];
      const nextTarget = isDefined(nextField?.relationTargetObjectMetadataId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: nextField.relationTargetObjectMetadataId,
            flatEntityMaps: context.flatObjectMetadataMaps,
          })
        : undefined;

      if (!isDefined(nextTarget))
        throw new Error('An inheritance path target no longer exists');
      const [nextHop] = resolveRecordPermissionPath({
        metadata: context,
        targetObjectUniversalIdentifier: nextTarget.universalIdentifier,
        path: {
          universalIdentifier: fields[1],
          sourceObjectUniversalIdentifier: targetObject.universalIdentifier,
          fieldUniversalIdentifiers: [fields[1]],
        },
      });
      await this.insertExpansions(
        database,
        context,
        records.flatMap((record) => {
          const value = record[nextHop.sourceColumn];
          return typeof value === 'string'
            ? [{ fields: fields.slice(1), value }]
            : [];
        }),
      );
    }
    if (records.length < batchSize) {
      await database.query(
        `DELETE FROM ${schema}."recordPermissionExpansion" WHERE id = $1`,
        [entry.id],
      );
    } else {
      await database.query(
        `UPDATE ${schema}."recordPermissionExpansion" SET cursor = $2 WHERE id = $1`,
        [entry.id, records[records.length - 1].id],
      );
    }

    return true;
  }

  private async processScan(
    database: RecordPermissionDatabase,
    context: RecordPermissionContext,
    groups: RecordPermissionAccessGroup[],
    projectionQueries: Map<string, SqlCondition>,
    batchSize: number,
  ): Promise<boolean> {
    const schema = escapeIdentifier(context.schemaName);
    const [scan] = await database.query(
      `SELECT * FROM ${schema}."recordPermissionScan" WHERE "revisionId" = $1 AND NOT complete ORDER BY "objectMetadataId" LIMIT 1`,
      [context.revisionId],
    );

    if (!isDefined(scan)) return false;
    const object = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: String(scan.objectMetadataId),
      flatEntityMaps: context.flatObjectMetadataMaps,
    });

    if (!isDefined(object))
      throw new Error('A projection object changed during the scan');
    const batch = await readRecordPermissionScanBatch({
      database,
      schemaName: context.schemaName,
      tableName: computeObjectTargetTable(object),
      batchSize,
      scan: {
        blockCursor: Number(scan.blockCursor),
        tupleCursor: Number(scan.tupleCursor ?? 0),
        blockLimit: isDefined(scan.blockLimit) ? Number(scan.blockLimit) : null,
        relationFileNode: isDefined(scan.relationFileNode)
          ? Number(scan.relationFileNode)
          : null,
      },
    });
    await recomputeRecordPermissionBatch({
      database,
      context,
      groups,
      projectionQueries,
      objectUniversalIdentifier: object.universalIdentifier,
      recordIds: batch.recordIds,
    });
    await database.query(
      `UPDATE ${schema}."recordPermissionScan" SET "blockCursor" = $3, "tupleCursor" = $8, "blockLimit" = $4, "relationFileNode" = $5, processed = processed + $6, complete = $7, "completedAt" = CASE WHEN $7 THEN now() ELSE "completedAt" END WHERE "revisionId" = $1 AND "objectMetadataId" = $2`,
      [
        context.revisionId,
        object.id,
        batch.blockCursor,
        batch.blockLimit,
        batch.relationFileNode,
        batch.recordIds.length,
        batch.complete,
        batch.tupleCursor ?? 0,
      ],
    );

    return true;
  }

  private async cleanRetiredRevisionState(
    database: RecordPermissionDatabase,
    context: RecordPermissionContext,
  ): Promise<boolean> {
    const schema = escapeIdentifier(context.schemaName);
    let removed = false;
    for (const table of [
      'recordPermissionWork',
      'recordPermissionExpansion',
      'recordPermissionScan',
      'recordPermissionAccessGroup',
    ]) {
      const rows = await database.query(
        `WITH removed AS (DELETE FROM ${schema}.${escapeIdentifier(table)} WHERE ctid IN (SELECT retired.ctid FROM ${schema}.${escapeIdentifier(table)} retired WHERE NOT EXISTS (SELECT 1 FROM ${schema}."recordPermissionState" WHERE "activeRevisionId" = retired."revisionId" OR "candidateRevisionId" = retired."revisionId") LIMIT 1000) RETURNING "revisionId") SELECT "revisionId" FROM removed`,
      );
      removed = removed || rows.length > 0;
    }
    return removed;
  }

  private async tryActivate(context: RecordPermissionContext): Promise<void> {
    const schema = escapeIdentifier(context.schemaName);

    await this.dataSource.transaction(async (manager) => {
      await manager.query("SET LOCAL lock_timeout = '100ms'");
      const [{ acquired }] = await manager.query(
        'SELECT pg_try_advisory_xact_lock(hashtextextended($1, 0)) AS acquired',
        [context.schemaName + ':record-permissions'],
      );

      if (!acquired) return;
      const [state] = await manager.query(
        `SELECT * FROM ${schema}."recordPermissionState" WHERE id FOR UPDATE`,
      );

      if (
        state.candidateRevisionId !== context.revisionId ||
        String(state.bindingGeneration) !== context.bindingGeneration
      )
        return;
      const [{ pending }] = await manager.query(
        `SELECT EXISTS (SELECT 1 FROM ${schema}."recordPermissionScan" WHERE "revisionId" = $1 AND NOT complete) OR EXISTS (SELECT 1 FROM ${schema}."recordPermissionWork" WHERE "revisionId" = $1) OR EXISTS (SELECT 1 FROM ${schema}."recordPermissionExpansion" WHERE "revisionId" = $1) AS pending`,
        [context.revisionId],
      );

      if (pending) return;
      if (isDefined(state.activeRevisionId))
        await manager
          .getRepository(RecordPermissionRevisionEntity)
          .update({ id: state.activeRevisionId }, { status: 'retired' });
      await manager
        .getRepository(RecordPermissionRevisionEntity)
        .update(
          { id: context.revisionId, status: 'building' },
          { status: 'active' },
        );
      await manager.query(
        `UPDATE ${schema}."recordPermissionState" SET "activeRevisionId" = $1, "candidateRevisionId" = NULL WHERE id`,
        [context.revisionId],
      );
      this.logger.log(
        `Activated record permission revision ${context.revisionId}`,
      );
    });
  }
}
