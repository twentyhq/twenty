import { Injectable } from '@nestjs/common';

import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { StoredFormulaFieldComputationService } from 'src/engine/core-modules/stored-formula-field/services/stored-formula-field-computation.service';
import { StoredFormulaFieldDirtyRecordService } from 'src/engine/core-modules/stored-formula-field/services/stored-formula-field-dirty-record.service';
import { type StoredFormulaWatchPlans } from 'src/engine/core-modules/stored-formula-field/types/stored-formula-watch-plans.type';
import { findStaleStoredFormulaRecordIdsByObjectMetadataId } from 'src/engine/core-modules/stored-formula-field/utils/find-stale-stored-formula-record-ids-by-object-metadata-id.util';
import { getStoredFormulaWatchPlans } from 'src/engine/core-modules/stored-formula-field/utils/build-stored-formula-watch-plans.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { OnDatabaseBatchEvent } from 'src/engine/workspace-event-emitter/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/workspace-event-emitter/enums/database-event-action';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

type RecordEventBatch = Pick<
  WorkspaceEventBatch<ObjectRecordBaseEvent<Record<string, unknown>>>,
  'workspaceId' | 'objectMetadata' | 'events'
>;

type MarkDirtyParameters<TWatchPlanName extends keyof StoredFormulaWatchPlans> =
  RecordEventBatch & {
    watchPlans: Pick<StoredFormulaWatchPlans, TWatchPlanName>;
    isRecordUpdate: boolean;
  };

type DirtyRecordKind = 'own' | 'related' | 'lookingUp';

@Injectable()
export class StoredFormulaFieldRecordEventListener {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly storedFormulaFieldDirtyRecordService: StoredFormulaFieldDirtyRecordService,
    private readonly storedFormulaFieldComputationService: StoredFormulaFieldComputationService,
  ) {}

  // A new record has stored formulas that were never computed, and no record looks it up yet
  @OnDatabaseBatchEvent('*', DatabaseEventAction.CREATED)
  async handleRecordsCreated(batch: RecordEventBatch): Promise<void> {
    await this.markRecordsDirty({
      batch,
      isRecordUpdate: false,
      dirtyRecordKinds: ['own', 'related'],
    });
  }

  // A restored record's stored formulas went stale while it was deleted
  @OnDatabaseBatchEvent('*', DatabaseEventAction.RESTORED)
  async handleRecordsRestored(batch: RecordEventBatch): Promise<void> {
    await this.markRecordsDirty({
      batch,
      isRecordUpdate: false,
      dirtyRecordKinds: ['own', 'related', 'lookingUp'],
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DELETED)
  @OnDatabaseBatchEvent('*', DatabaseEventAction.DESTROYED)
  async handleRecordsRemoved(batch: RecordEventBatch): Promise<void> {
    await this.markRecordsDirty({
      batch,
      isRecordUpdate: false,
      dirtyRecordKinds: ['related', 'lookingUp'],
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPDATED)
  async handleRecordsUpdated(batch: RecordEventBatch): Promise<void> {
    await this.markRecordsDirty({
      batch,
      isRecordUpdate: true,
      dirtyRecordKinds: ['own', 'related', 'lookingUp'],
    });
  }

  private async markRecordsDirty({
    batch,
    isRecordUpdate,
    dirtyRecordKinds,
  }: {
    batch: RecordEventBatch;
    isRecordUpdate: boolean;
    dirtyRecordKinds: DirtyRecordKind[];
  }): Promise<void> {
    const watchPlans = getStoredFormulaWatchPlans(
      await this.workspaceCacheService.getOrRecompute(batch.workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMapsOrm',
      ]),
    );
    const markDirtyParameters = { ...batch, watchPlans, isRecordUpdate };

    await Promise.all([
      dirtyRecordKinds.includes('own')
        ? this.markOwnRecordsDirty(markDirtyParameters)
        : undefined,
      dirtyRecordKinds.includes('related')
        ? this.markRelatedRecordsDirty(markDirtyParameters)
        : undefined,
      dirtyRecordKinds.includes('lookingUp')
        ? this.markLookingUpRecordsDirty(markDirtyParameters)
        : undefined,
    ]);
  }

  private async markLookingUpRecordsDirty({
    workspaceId,
    objectMetadata,
    events,
    watchPlans: { lookedUpRecordWatchPlansByObjectMetadataId },
    isRecordUpdate,
  }: MarkDirtyParameters<'lookedUpRecordWatchPlansByObjectMetadataId'>): Promise<void> {
    const watchPlans =
      lookedUpRecordWatchPlansByObjectMetadataId[objectMetadata.id] ?? [];

    await Promise.all(
      watchPlans.map(
        async ({ objectMetadataId, joinColumnName, watchedFieldNames }) => {
          const lookedUpRecordIds = events
            .filter(
              ({ properties: { updatedFields } }) =>
                !isRecordUpdate ||
                (updatedFields ?? []).some((fieldName) =>
                  watchedFieldNames.has(fieldName),
                ),
            )
            .map(({ recordId }) => recordId);

          if (!isNonEmptyArray(lookedUpRecordIds)) {
            return;
          }

          await this.storedFormulaFieldComputationService.markRecordsDirtyByJoinColumnValues(
            {
              workspaceId,
              objectMetadataId,
              joinColumnName,
              joinColumnValues: lookedUpRecordIds,
            },
          );
        },
      ),
    );
  }

  private async markOwnRecordsDirty({
    workspaceId,
    objectMetadata,
    events,
    watchPlans: { watchedOwnFieldNamesByObjectMetadataId },
    isRecordUpdate,
  }: MarkDirtyParameters<'watchedOwnFieldNamesByObjectMetadataId'>): Promise<void> {
    const watchedOwnFieldNames =
      watchedOwnFieldNamesByObjectMetadataId[objectMetadata.id];

    if (!isDefined(watchedOwnFieldNames)) {
      return;
    }

    const recordIds = events
      .filter(
        ({ properties: { updatedFields } }) =>
          !isRecordUpdate ||
          (updatedFields ?? []).some((fieldName) =>
            watchedOwnFieldNames.has(fieldName),
          ),
      )
      .map(({ recordId }) => recordId);

    if (!isNonEmptyArray(recordIds)) {
      return;
    }

    await this.storedFormulaFieldDirtyRecordService.markRecordsDirty({
      workspaceId,
      objectMetadataId: objectMetadata.id,
      recordIds,
    });
  }

  private async markRelatedRecordsDirty({
    workspaceId,
    objectMetadata,
    events,
    watchPlans: { relatedRecordWatchPlansByObjectMetadataId },
    isRecordUpdate,
  }: MarkDirtyParameters<'relatedRecordWatchPlansByObjectMetadataId'>): Promise<void> {
    const watchPlans =
      relatedRecordWatchPlansByObjectMetadataId[objectMetadata.id];

    if (!isDefined(watchPlans)) {
      return;
    }

    const staleRecordIdsByObjectMetadataId =
      findStaleStoredFormulaRecordIdsByObjectMetadataId({
        events,
        watchPlans,
        isRecordUpdate,
      });

    await Promise.all(
      Object.entries(staleRecordIdsByObjectMetadataId).map(
        ([objectMetadataId, recordIds]) =>
          this.storedFormulaFieldDirtyRecordService.markRecordsDirty({
            workspaceId,
            objectMetadataId,
            recordIds,
          }),
      ),
    );
  }
}
