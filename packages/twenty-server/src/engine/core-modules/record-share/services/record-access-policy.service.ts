/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { MetadataReadability, type ObjectRecord } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';
import { In } from 'typeorm';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type EventRecordAccessGate } from 'src/engine/core-modules/record-share/types/event-record-access-gate.type';
import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import {
  type EventRecordSnapshot,
  resolveEventRecordSnapshots,
} from 'src/engine/core-modules/record-share/utils/resolve-event-record-snapshots.util';
import { resolveRecordIdsSharedWithPrincipals } from 'src/engine/core-modules/record-share/utils/resolve-record-ids-shared-with-principals.util';
import { resolveRecordShareGateKind } from 'src/engine/core-modules/record-share/utils/resolve-record-share-gate-kind.util';
import { MAX_INHERITED_READABILITY_DEPTH } from 'src/engine/core-modules/record-share/constants/max-inherited-readability-depth.constant';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/core-modules/record-share/utils/resolve-required-record-share-access-levels.util';
import { type InheritedReadabilityChildrenParent } from 'src/engine/core-modules/record-share/types/inherited-readability-children-parent.type';
import { type InheritedReadabilityColumnParent } from 'src/engine/core-modules/record-share/types/inherited-readability-column-parent.type';
import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { isObjectOperationPermitted } from 'src/engine/twenty-orm/utils/is-object-operation-permitted.util';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util';
import { resolveInheritedReadabilityParents } from 'src/engine/core-modules/record-share/utils/resolve-inherited-readability-parents.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

type ReadabilityMaps = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMapsOrm: FlatEntityMaps<OrmFlatFieldMetadata>;
};

type SnapshotEvaluation = {
  workspaceId: string;
  objectMetadata: FlatObjectMetadata;
  snapshots: EventRecordSnapshot[];
  subject: RowAccessPolicySubject;
  depth: number;
  maps?: ReadabilityMaps;
  isLegacyRecordAccessOpen?: boolean;
};

type SnapshotEvaluationInContext = SnapshotEvaluation & {
  maps: ReadabilityMaps;
};

type FetchRecordShares = () => Promise<RecordShare[]>;

@Injectable()
export class RecordAccessPolicyService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly recordSharingFeatureService: RecordSharingFeatureService,
  ) {}

  // A subject receives the records a query would return it: its role must read
  // the object and the row-level filter must hold on the event snapshot before
  // the share gate of the object is consulted.
  buildEventRecordAccessGate({
    workspaceId,
    objectMetadata,
    events,
  }: WorkspaceEventBatch<ObjectRecordEvent>): EventRecordAccessGate {
    let recordSharesPromise: Promise<RecordShare[]> | undefined;
    const fetchRecordShares: FetchRecordShares = () =>
      (recordSharesPromise ??= this.recordShareStorageService.findByRecordIds({
        workspaceId,
        objectMetadataId: objectMetadata.id,
        recordIds: events.map((event) => event.recordId),
      }));

    let legacyRecordAccessOpenPromise: Promise<boolean> | undefined;
    const fetchLegacyRecordAccessOpen = () =>
      (legacyRecordAccessOpenPromise ??=
        this.recordSharingFeatureService.isLegacyRecordAccessOpen(workspaceId));

    return {
      resolveAdmittedRecordIds: async (subject) => {
        const snapshots = await this.resolveSnapshotsReadableByRole({
          workspaceId,
          objectMetadata,
          snapshots: resolveEventRecordSnapshots(events),
          subject,
          depth: 0,
        });

        if (snapshots.length === 0) {
          return new Set();
        }

        return this.resolveSnapshotIdsAdmittedByRecordShareGate(
          {
            workspaceId,
            objectMetadata,
            snapshots,
            subject,
            depth: 0,
            isLegacyRecordAccessOpen:
              objectMetadata.readability !== MetadataReadability.SYSTEM &&
              objectMetadata.readability !== MetadataReadability.OPEN &&
              (await fetchLegacyRecordAccessOpen()),
          },
          fetchRecordShares,
        );
      },
    };
  }

  private async resolveSnapshotsReadableByRole({
    workspaceId,
    objectMetadata,
    snapshots,
    subject,
    maps,
  }: SnapshotEvaluation): Promise<EventRecordSnapshot[]> {
    if (snapshots.length === 0) {
      return [];
    }

    if (
      isDefined(subject.objectsPermissions) &&
      !isObjectOperationPermitted({
        objectMetadata,
        operationType: 'select',
        objectsPermissions: subject.objectsPermissions,
      })
    ) {
      return [];
    }

    const rowLevelPermissionRecordFilter =
      subject.resolveRowLevelPermissionRecordFilter(objectMetadata);

    if (
      !isDefined(rowLevelPermissionRecordFilter) ||
      Object.keys(rowLevelPermissionRecordFilter).length === 0
    ) {
      return snapshots;
    }

    const flatFieldMetadataMaps =
      maps?.flatFieldMetadataMapsOrm ??
      (
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatFieldMetadataMapsOrm',
        ])
      ).flatFieldMetadataMapsOrm;

    return snapshots.filter((snapshot) =>
      isRecordMatchingRLSRowLevelPermissionPredicate({
        record: snapshot,
        filter: rowLevelPermissionRecordFilter,
        flatObjectMetadata: objectMetadata,
        flatFieldMetadataMaps,
        shouldIgnoreSoftDeleteDefaultFilter: true,
      }),
    );
  }

  private async resolveSnapshotIdsAdmittedByRecordShareGate(
    evaluation: SnapshotEvaluation,
    fetchRecordShares: FetchRecordShares,
  ): Promise<Set<string>> {
    const { objectMetadata, snapshots, subject } = evaluation;
    const legacyOpen =
      evaluation.isLegacyRecordAccessOpen ??
      (await this.recordSharingFeatureService.isLegacyRecordAccessOpen(
        evaluation.workspaceId,
      ));
    const gateKind = resolveRecordShareGateKind({
      isLegacyRecordAccessOpen: legacyOpen,
      readability: objectMetadata.readability,
      isOwningApplication: subject.isOwningApplication(objectMetadata),
    });

    switch (gateKind) {
      case 'open':
        return new Set(snapshots.map((snapshot) => snapshot.id));
      case 'deny':
        return new Set();
      case 'private':
        return this.resolveSnapshotIdsSharedWithSubject(
          evaluation,
          fetchRecordShares,
        );
      case 'inherited':
        return new Set([
          ...(await this.resolveSnapshotIdsSharedWithSubject(
            evaluation,
            fetchRecordShares,
          )),
          ...(await this.resolveSnapshotIdsReadableThroughParents({
            ...evaluation,
            isLegacyRecordAccessOpen: legacyOpen,
          })),
        ]);
      default:
        return assertUnreachable(gateKind);
    }
  }

  private async resolveSnapshotIdsSharedWithSubject(
    { snapshots, subject }: SnapshotEvaluation,
    fetchRecordShares: FetchRecordShares,
  ): Promise<Set<string>> {
    const snapshotIds = snapshots.map((snapshot) => snapshot.id);

    if (!isDefined(subject.principalIds) || snapshotIds.length === 0) {
      return new Set(snapshotIds);
    }

    const sharedRecordIds = resolveRecordIdsSharedWithPrincipals({
      recordShares: await fetchRecordShares(),
      principalIds: subject.principalIds,
      accessLevels: resolveRequiredRecordShareAccessLevels('select'),
    });

    return new Set(
      snapshotIds.filter((snapshotId) => sharedRecordIds.has(snapshotId)),
    );
  }

  private async resolveSnapshotIdsReadableThroughParents(
    evaluation: SnapshotEvaluation,
  ): Promise<Set<string>> {
    const { workspaceId, objectMetadata, maps } = evaluation;

    if (!isDefined(maps)) {
      const loadedMaps = await this.workspaceCacheService.getOrRecompute(
        workspaceId,
        ['flatObjectMetadataMaps', 'flatFieldMetadataMapsOrm'],
      );

      return this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.resolveSnapshotIdsReadableThroughParents({
            ...evaluation,
            maps: loadedMaps,
          }),
        buildSystemAuthContext(workspaceId),
      );
    }

    const parents = resolveInheritedReadabilityParents({
      flatObjectMetadata: objectMetadata,
      flatFieldMetadataMaps: maps.flatFieldMetadataMapsOrm,
      flatObjectMetadataMaps: maps.flatObjectMetadataMaps,
    });
    const readableSnapshotIds = new Set<string>();

    for (const parent of parents) {
      const readableIds =
        parent.kind === 'column'
          ? await this.resolveSnapshotIdsReadableThroughColumnParent({
              ...evaluation,
              maps,
              parent,
            })
          : await this.resolveSnapshotIdsReadableThroughChildren({
              ...evaluation,
              maps,
              parent,
            });

      for (const readableId of readableIds) {
        readableSnapshotIds.add(readableId);
      }
    }

    return readableSnapshotIds;
  }

  private async resolveSnapshotIdsReadableThroughColumnParent({
    snapshots,
    subject,
    depth,
    parent,
  }: SnapshotEvaluationInContext & {
    parent: InheritedReadabilityColumnParent;
  }): Promise<Set<string>> {
    const parentIdBySnapshotId = new Map(
      snapshots.flatMap((snapshot) => {
        const parentId = snapshot[parent.joinColumnName];

        return isNonEmptyString(parentId) ? [[snapshot.id, parentId]] : [];
      }),
    );
    const readableParentIds = await this.selectReadableRecordIds({
      objectMetadata: parent.parentFlatObjectMetadata,
      recordIds: [...new Set(parentIdBySnapshotId.values())],
      subject,
      depth: depth + 1,
    });

    return new Set(
      [...parentIdBySnapshotId]
        .filter(([, parentId]) => readableParentIds.has(parentId))
        .map(([snapshotId]) => snapshotId),
    );
  }

  private async resolveSnapshotIdsReadableThroughChildren({
    workspaceId,
    snapshots,
    subject,
    depth,
    maps,
    isLegacyRecordAccessOpen,
    parent,
  }: SnapshotEvaluationInContext & {
    parent: InheritedReadabilityChildrenParent;
  }): Promise<Set<string>> {
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

    if (liveSnapshotIds.length > 0) {
      const childRows = await this.workspaceOrmManager
        .getRepository(childNameSingular, {
          shouldBypassPermissionChecks: true,
        })
        .createQueryBuilder()
        .select(['id', parent.childJoinColumnName])
        .where({ [parent.childJoinColumnName]: In(liveSnapshotIds) })
        .getMany<ObjectRecord>({ noFormatting: true });
      const readableChildIds = await this.selectReadableRecordIds({
        objectMetadata: parent.childFlatObjectMetadata,
        recordIds: childRows.map((childRow) => String(childRow.id)),
        subject,
        depth: depth + 1,
      });

      for (const childRow of childRows) {
        if (readableChildIds.has(String(childRow.id))) {
          readableSnapshotIds.add(String(childRow[parent.childJoinColumnName]));
        }
      }
    }

    const readableCapturedChildIds = await this.resolveReadableSnapshotIds({
      workspaceId,
      objectMetadata: parent.childFlatObjectMetadata,
      snapshots: [...capturedChildSnapshotsBySnapshotId.values()].flat(),
      subject,
      depth: depth + 1,
      maps,
      isLegacyRecordAccessOpen,
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

    return readableSnapshotIds;
  }

  private async resolveReadableSnapshotIds(
    evaluation: SnapshotEvaluationInContext,
  ): Promise<Set<string>> {
    const { workspaceId, objectMetadata, depth } = evaluation;

    if (depth > MAX_INHERITED_READABILITY_DEPTH) {
      return new Set();
    }

    const candidateSnapshots =
      await this.resolveSnapshotsReadableByRole(evaluation);

    if (candidateSnapshots.length === 0) {
      return new Set();
    }

    return this.resolveSnapshotIdsAdmittedByRecordShareGate(
      { ...evaluation, snapshots: candidateSnapshots },
      () =>
        this.recordShareStorageService.findByRecordIds({
          workspaceId,
          objectMetadataId: objectMetadata.id,
          recordIds: candidateSnapshots.map((snapshot) => snapshot.id),
        }),
    );
  }

  private async selectReadableRecordIds({
    objectMetadata,
    recordIds,
    subject,
    depth,
  }: {
    objectMetadata: FlatObjectMetadata;
    recordIds: string[];
    subject: RowAccessPolicySubject;
    depth: number;
  }): Promise<Set<string>> {
    if (recordIds.length === 0) {
      return new Set();
    }

    const repository = this.workspaceOrmManager.getRepository(
      objectMetadata.nameSingular,
      { shouldBypassPermissionChecks: true },
    );
    const policy = repository.buildRowAccessPolicy({
      subject,
      operationType: 'select',
      depth,
    });

    switch (policy.kind) {
      case 'open':
        return new Set(recordIds);
      case 'denied':
        return new Set();
      case 'gated': {
        const rows = await repository
          .createQueryBuilder()
          .select(['id'])
          .where({ id: In(recordIds) })
          .withDeleted()
          .andWhere(policy.condition.sql, policy.condition.parameters)
          .getMany<ObjectRecord>({ noFormatting: true });

        return new Set(rows.map((row) => String(row.id)));
      }
    }
  }
}
