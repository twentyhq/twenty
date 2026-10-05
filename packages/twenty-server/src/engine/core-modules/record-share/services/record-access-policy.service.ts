/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import groupBy from 'lodash.groupby';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, MoreThanOrEqual } from 'typeorm';

import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type EventRecordAccessGate } from 'src/engine/core-modules/record-share/types/event-record-access-gate.type';
import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import {
  evaluateRowAccessPolicy,
  type RowAccessEvaluationContext,
} from 'src/engine/core-modules/record-share/utils/evaluate-row-access-policy.util';
import { resolveRecordShareFeatureFlags } from 'src/engine/core-modules/record-share/utils/resolve-record-share-feature-flags.util';
import {
  type EventRecordSnapshot,
  resolveEventRecordSnapshots,
} from 'src/engine/core-modules/record-share/utils/resolve-event-record-snapshots.util';
import { type InheritedReadabilityParentExpression } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { buildRowAccessPolicy } from 'src/engine/twenty-orm/utils/build-row-access-policy.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { isChildRecordBoundAtDeletion } from 'src/engine/twenty-orm/utils/is-child-record-bound-at-deletion.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

type ColumnParentExpression = Extract<
  InheritedReadabilityParentExpression,
  { kind: 'column' }
>;

type ChildrenParentExpression = Extract<
  InheritedReadabilityParentExpression,
  { kind: 'children' }
>;

type SnapshotIdsThroughParent = {
  readableSnapshotIds: Set<string>;
  attachedSnapshotIds: Set<string>;
};

@Injectable()
export class RecordAccessPolicyService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
  ) {}

  // A subject receives the records a query would return it: the event
  // snapshots are run through the same row access policy as its queries.
  buildEventRecordAccessGate({
    workspaceId,
    objectMetadata,
    events,
  }: WorkspaceEventBatch<ObjectRecordEvent>): EventRecordAccessGate {
    // One lookup per object for the whole batch: operands only ever ask for
    // records of the batch, so later calls are served from what was fetched
    const recordSharesByRecordIdByObject = new Map<
      string,
      Map<string, Promise<RecordShare[]>>
    >();
    const fetchRecordShares = async ({
      objectMetadataId,
      recordIds,
    }: {
      objectMetadataId: string;
      recordIds: string[];
    }) => {
      const recordSharesByRecordId =
        recordSharesByRecordIdByObject.get(objectMetadataId) ??
        new Map<string, Promise<RecordShare[]>>();

      recordSharesByRecordIdByObject.set(
        objectMetadataId,
        recordSharesByRecordId,
      );

      const uniqueRecordIds = [...new Set(recordIds)];
      const missingRecordIds = uniqueRecordIds.filter(
        (recordId) => !recordSharesByRecordId.has(recordId),
      );

      if (missingRecordIds.length > 0) {
        const groupedRecordShares = this.recordShareStorageService
          .findByRecordIds({
            workspaceId,
            objectMetadataId,
            recordIds: missingRecordIds,
          })
          .then((recordShares) =>
            groupBy(recordShares, (recordShare) => recordShare.recordId),
          );

        for (const recordId of missingRecordIds) {
          recordSharesByRecordId.set(
            recordId,
            groupedRecordShares.then(
              (recordSharesOfRecord) => recordSharesOfRecord[recordId] ?? [],
            ),
          );
        }
      }

      const recordSharesPerRecord = await Promise.all(
        uniqueRecordIds.map(
          (recordId) => recordSharesByRecordId.get(recordId) ?? [],
        ),
      );

      return recordSharesPerRecord.flat();
    };

    return {
      resolveAdmittedRecordIds: async (subject) => {
        const {
          flatObjectMetadataMaps,
          flatFieldMetadataMapsOrm,
          featureFlagsMap,
        } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
          'flatFieldMetadataMapsOrm',
          'featureFlagsMap',
        ]);
        const context: RowAccessEvaluationContext<EventRecordSnapshot> = {
          flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
          shouldIgnoreSoftDeleteDefaultFilter: true,
          fetchRecordShares,
          // Parents and children are only reached through their tables
          resolveRecordIdsReadableThroughParents: ({ expression, records }) =>
            this.workspaceOrmManager.executeInWorkspaceContext(async () => {
              const readableSnapshotIds = new Set<string>();
              const attachedSnapshotIds = new Set<string>();

              for (const parent of expression.parents) {
                const throughParent =
                  parent.kind === 'column'
                    ? await this.resolveSnapshotIdsReadableThroughColumnParent({
                        parent,
                        snapshots: records,
                      })
                    : await this.resolveSnapshotIdsReadableThroughChildren({
                        parent,
                        snapshots: records,
                        isOpenWhenDetached: expression.isOpenWhenDetached,
                        context,
                      });

                throughParent.readableSnapshotIds.forEach((id) =>
                  readableSnapshotIds.add(id),
                );
                throughParent.attachedSnapshotIds.forEach((id) =>
                  attachedSnapshotIds.add(id),
                );
              }

              if (expression.isOpenWhenDetached) {
                for (const record of records) {
                  if (!attachedSnapshotIds.has(record.id)) {
                    readableSnapshotIds.add(record.id);
                  }
                }
              }

              return readableSnapshotIds;
            }, buildSystemAuthContext(workspaceId)),
        };

        return evaluateRowAccessPolicy({
          policy: buildRowAccessPolicy({
            subject,
            environment: {
              flatObjectMetadataMaps,
              flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
              ...resolveRecordShareFeatureFlags(featureFlagsMap),
            },
            tableAlias: objectMetadata.nameSingular,
            flatObjectMetadata: objectMetadata,
            operationType: 'select',
            depth: 0,
          }),
          records: resolveEventRecordSnapshots(events),
          context,
        });
      },
    };
  }

  private async resolveSnapshotIdsReadableThroughColumnParent({
    parent,
    snapshots,
  }: {
    parent: ColumnParentExpression;
    snapshots: EventRecordSnapshot[];
  }): Promise<SnapshotIdsThroughParent> {
    const parentIdBySnapshotId = new Map(
      snapshots.flatMap((snapshot) => {
        const parentId = snapshot[parent.joinColumnName];

        return isNonEmptyString(parentId) ? [[snapshot.id, parentId]] : [];
      }),
    );
    const readableParentIds = await this.workspaceOrmManager
      .getRepository(parent.parentFlatObjectMetadata.nameSingular, {
        shouldBypassPermissionChecks: true,
      })
      .findRecordIdsAdmittedByRowAccessPolicy({
        recordIds: [...new Set(parentIdBySnapshotId.values())],
        policy: parent.policy,
        tableAlias: parent.parentTableAlias,
      });

    return {
      readableSnapshotIds: new Set(
        [...parentIdBySnapshotId]
          .filter(([, parentId]) => readableParentIds.has(parentId))
          .map(([snapshotId]) => snapshotId),
      ),
      attachedSnapshotIds: new Set(parentIdBySnapshotId.keys()),
    };
  }

  private async resolveSnapshotIdsReadableThroughChildren({
    parent,
    snapshots,
    isOpenWhenDetached,
    context,
  }: {
    parent: ChildrenParentExpression;
    snapshots: EventRecordSnapshot[];
    isOpenWhenDetached: boolean;
    context: RowAccessEvaluationContext<EventRecordSnapshot>;
  }): Promise<SnapshotIdsThroughParent> {
    const childNameSingular = parent.childFlatObjectMetadata.nameSingular;
    const capturedChildSnapshotsBySnapshotId = new Map(
      snapshots.flatMap((snapshot) => {
        const capturedChildRecords =
          snapshot.inheritedReadabilityChildRecords?.[childNameSingular];

        return isDefined(capturedChildRecords)
          ? [
              [
                snapshot.id,
                capturedChildRecords.map(
                  (childRecord): EventRecordSnapshot => ({
                    ...childRecord,
                    id: String(childRecord.id),
                  }),
                ),
              ] as const,
            ]
          : [];
      }),
    );
    const liveSnapshotIds = snapshots
      .filter(
        (snapshot) => !capturedChildSnapshotsBySnapshotId.has(snapshot.id),
      )
      .map((snapshot) => snapshot.id);

    const readableSnapshotIds = new Set<string>();
    const attachedSnapshotIds = new Set(
      [...capturedChildSnapshotsBySnapshotId]
        .filter(
          ([, capturedChildSnapshots]) => capturedChildSnapshots.length > 0,
        )
        .map(([snapshotId]) => snapshotId),
    );

    if (liveSnapshotIds.length > 0) {
      const childRepository = this.workspaceOrmManager.getRepository(
        childNameSingular,
        { shouldBypassPermissionChecks: true },
      );
      const childRows = await childRepository
        .createQueryBuilder()
        .select(['id', parent.childJoinColumnName])
        .where({ [parent.childJoinColumnName]: In(liveSnapshotIds) })
        .getMany<ObjectRecord>({ noFormatting: true });
      const readableChildIds =
        await childRepository.findRecordIdsAdmittedByRowAccessPolicy({
          recordIds: childRows.map((childRow) => String(childRow.id)),
          policy: parent.policy,
          tableAlias: parent.childTableAlias,
        });

      for (const childRow of childRows) {
        const snapshotId = String(childRow[parent.childJoinColumnName]);

        attachedSnapshotIds.add(snapshotId);

        if (readableChildIds.has(String(childRow.id))) {
          readableSnapshotIds.add(snapshotId);
        }
      }

      const trashedSnapshots = snapshots.filter(
        (snapshot) =>
          !capturedChildSnapshotsBySnapshotId.has(snapshot.id) &&
          isDefined(snapshot.deletedAt),
      );

      if (isOpenWhenDetached && trashedSnapshots.length > 0) {
        const snapshotById = new Map(
          trashedSnapshots.map((snapshot) => [snapshot.id, snapshot]),
        );
        const earliestDeletedAt = new Date(
          Math.min(
            ...trashedSnapshots.map((snapshot) =>
              new Date(String(snapshot.deletedAt)).getTime(),
            ),
          ),
        );
        // A row trashed along with the record still attaches it, as in the
        // query gate; rows trashed before any of these records cannot
        const trashedChildRows = await childRepository
          .createQueryBuilder()
          .select(['id', parent.childJoinColumnName, 'deletedAt'])
          .where({
            [parent.childJoinColumnName]: In([...snapshotById.keys()]),
            deletedAt: MoreThanOrEqual(earliestDeletedAt),
          })
          .withDeleted()
          .getMany<ObjectRecord>({ noFormatting: true });

        for (const childRow of trashedChildRows) {
          const snapshotId = String(childRow[parent.childJoinColumnName]);
          const snapshot = snapshotById.get(snapshotId);

          if (
            isDefined(snapshot) &&
            isChildRecordBoundAtDeletion({
              childRecord: childRow,
              record: snapshot,
            })
          ) {
            attachedSnapshotIds.add(snapshotId);
          }
        }
      }
    }

    const readableCapturedChildIds = await evaluateRowAccessPolicy({
      policy: parent.policy,
      records: [...capturedChildSnapshotsBySnapshotId.values()].flat(),
      context,
    });

    for (const [
      snapshotId,
      capturedChildSnapshots,
    ] of capturedChildSnapshotsBySnapshotId) {
      if (
        capturedChildSnapshots.some((childSnapshot) =>
          readableCapturedChildIds.has(childSnapshot.id),
        )
      ) {
        readableSnapshotIds.add(snapshotId);
      }
    }

    return { readableSnapshotIds, attachedSnapshotIds };
  }
}
