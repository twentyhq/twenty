/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { FeatureFlagKey, type ObjectRecord } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';
import { In, MoreThanOrEqual } from 'typeorm';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type EventRecordAccessGate } from 'src/engine/core-modules/record-share/types/event-record-access-gate.type';
import { type RecordShare } from 'src/engine/core-modules/record-share/types/record-share.type';
import {
  type EventRecordSnapshot,
  resolveEventRecordSnapshots,
} from 'src/engine/core-modules/record-share/utils/resolve-event-record-snapshots.util';
import { resolveNamedPrincipalIds } from 'src/engine/core-modules/record-share/utils/resolve-named-principal-ids.util';
import { resolveRecordIdsRestrictedForPrincipals } from 'src/engine/core-modules/record-share/utils/resolve-record-ids-restricted-for-principals.util';
import { resolveRecordIdsSharedWithPrincipals } from 'src/engine/core-modules/record-share/utils/resolve-record-ids-shared-with-principals.util';
import { isRecordGrantBeyondRoleAllowed } from 'src/engine/core-modules/record-share/utils/is-record-grant-beyond-role-allowed.util';
import { shouldEnforceRecordShareExceptions } from 'src/engine/core-modules/record-share/utils/should-enforce-record-share-exceptions.util';
import { resolveRecordShareGateKind } from 'src/engine/core-modules/record-share/utils/resolve-record-share-gate-kind.util';
import { MAX_INHERITED_READABILITY_DEPTH } from 'src/engine/core-modules/record-share/constants/max-inherited-readability-depth.constant';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/core-modules/record-share/utils/resolve-required-record-share-access-levels.util';
import { type InheritedReadabilityChildrenParent } from 'src/engine/core-modules/record-share/types/inherited-readability-children-parent.type';
import { type InheritedReadabilityColumnParent } from 'src/engine/core-modules/record-share/types/inherited-readability-column-parent.type';
import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { isObjectOperationPermitted } from 'src/engine/twenty-orm/utils/is-object-operation-permitted.util';
import { isChildRecordBoundAtDeletion } from 'src/engine/twenty-orm/utils/is-child-record-bound-at-deletion.util';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util';
import { resolveInheritedReadabilityParents } from 'src/engine/core-modules/record-share/utils/resolve-inherited-readability-parents.util';
import { isOpenWhenDetachedObject } from 'src/engine/core-modules/record-share/utils/is-open-when-detached-object.util';
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
};

type SnapshotEvaluationInContext = SnapshotEvaluation & {
  maps: ReadabilityMaps;
};

type FetchRecordShares = () => Promise<RecordShare[]>;

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

  // Mirrors the query gate: role read, then the row-level filter on the event snapshot, then the share gate.
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

    return {
      resolveAdmittedRecordIds: async (subject) => {
        const eventSnapshots = resolveEventRecordSnapshots(events);
        const snapshots = await this.resolveSnapshotsReadableByRole({
          workspaceId,
          objectMetadata,
          snapshots: eventSnapshots,
          subject,
          depth: 0,
        });

        const admittedSnapshotIds =
          snapshots.length === 0
            ? new Set<string>()
            : await this.resolveSnapshotIdsAdmittedByRecordShareGate(
                {
                  workspaceId,
                  objectMetadata,
                  snapshots,
                  subject,
                  depth: 0,
                },
                fetchRecordShares,
              );

        return new Set([
          ...admittedSnapshotIds,
          ...(await this.resolveSnapshotIdsGrantedBeyondRole(
            { workspaceId, objectMetadata, snapshots: eventSnapshots, subject },
            fetchRecordShares,
          )),
        ]);
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
    const gateKind = resolveRecordShareGateKind({
      readability: objectMetadata.readability,
      isOwningApplication: subject.isOwningApplication(objectMetadata),
    });

    switch (gateKind) {
      case 'open':
        return (await this.areRecordShareExceptionsEnforced(evaluation))
          ? this.resolveSnapshotIdsNotRestrictedForSubject(
              evaluation,
              fetchRecordShares,
            )
          : new Set(snapshots.map((snapshot) => snapshot.id));
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
          })),
        ]);
      default:
        return assertUnreachable(gateKind);
    }
  }

  // A record shared by name reaches its recipients whatever their role or row
  // filter says about the object, as the row access policy does
  private async resolveSnapshotIdsGrantedBeyondRole(
    {
      workspaceId,
      objectMetadata,
      snapshots,
      subject,
    }: Omit<SnapshotEvaluation, 'depth'>,
    fetchRecordShares: FetchRecordShares,
  ): Promise<Set<string>> {
    const namedPrincipalIds = resolveNamedPrincipalIds(subject);

    if (
      snapshots.length === 0 ||
      namedPrincipalIds.length === 0 ||
      !isRecordGrantBeyondRoleAllowed({
        flatObjectMetadata: objectMetadata,
        operationType: 'select',
        isRecordSharingEnabled: await this.isRecordSharingEnabled(workspaceId),
      })
    ) {
      return new Set();
    }

    const grantedRecordIds = resolveRecordIdsSharedWithPrincipals({
      recordShares: await fetchRecordShares(),
      principalIds: namedPrincipalIds,
      accessLevels: resolveRequiredRecordShareAccessLevels('select'),
    });

    return new Set(
      snapshots
        .map((snapshot) => snapshot.id)
        .filter((snapshotId) => grantedRecordIds.has(snapshotId)),
    );
  }

  private async isRecordSharingEnabled(workspaceId: string): Promise<boolean> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    return (
      featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED] ?? false
    );
  }

  private async areRecordShareExceptionsEnforced({
    workspaceId,
    objectMetadata,
    subject,
  }: SnapshotEvaluation): Promise<boolean> {
    return shouldEnforceRecordShareExceptions({
      flatObjectMetadata: objectMetadata,
      isRecordSharingEnabled: await this.isRecordSharingEnabled(workspaceId),
      canAccessAllRecords: subject.canAccessAllRecords,
    });
  }

  private async resolveSnapshotIdsNotRestrictedForSubject(
    { snapshots, subject }: SnapshotEvaluation,
    fetchRecordShares: FetchRecordShares,
  ): Promise<Set<string>> {
    const snapshotIds = snapshots.map((snapshot) => snapshot.id);

    if (!isDefined(subject.principalIds) || snapshotIds.length === 0) {
      return new Set(snapshotIds);
    }

    const restrictedRecordIds = resolveRecordIdsRestrictedForPrincipals({
      recordShares: await fetchRecordShares(),
      principalIds: subject.principalIds,
      accessLevels: resolveRequiredRecordShareAccessLevels('select'),
    });

    return new Set(
      snapshotIds.filter((snapshotId) => !restrictedRecordIds.has(snapshotId)),
    );
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
    const attachedSnapshotIds = new Set<string>();

    for (const parent of parents) {
      const snapshotIdsThroughParent =
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

      for (const readableId of snapshotIdsThroughParent.readableSnapshotIds) {
        readableSnapshotIds.add(readableId);
      }

      for (const attachedId of snapshotIdsThroughParent.attachedSnapshotIds) {
        attachedSnapshotIds.add(attachedId);
      }
    }

    if (isOpenWhenDetachedObject(objectMetadata)) {
      for (const snapshot of evaluation.snapshots) {
        if (!attachedSnapshotIds.has(snapshot.id)) {
          readableSnapshotIds.add(snapshot.id);
        }
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
  }): Promise<SnapshotIdsThroughParent> {
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
    workspaceId,
    objectMetadata,
    snapshots,
    subject,
    depth,
    maps,
    parent,
  }: SnapshotEvaluationInContext & {
    parent: InheritedReadabilityChildrenParent;
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
      const readableChildIds = await this.selectReadableRecordIds({
        objectMetadata: parent.childFlatObjectMetadata,
        recordIds: childRows.map((childRow) => String(childRow.id)),
        subject,
        depth: depth + 1,
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

      if (
        isOpenWhenDetachedObject(objectMetadata) &&
        trashedSnapshots.length > 0
      ) {
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
        // Rows trashed along with the record still attach it, as in the query gate; rows trashed earlier do not.
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

    const readableCapturedChildIds = await this.resolveReadableSnapshotIds({
      workspaceId,
      objectMetadata: parent.childFlatObjectMetadata,
      snapshots: [...capturedChildSnapshotsBySnapshotId.values()].flat(),
      subject,
      depth: depth + 1,
      maps,
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
