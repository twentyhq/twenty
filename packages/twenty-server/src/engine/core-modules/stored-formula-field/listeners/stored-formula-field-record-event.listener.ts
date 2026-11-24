import { Injectable } from '@nestjs/common';

import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { StoredFormulaFieldDirtyRecordService } from 'src/engine/core-modules/stored-formula-field/services/stored-formula-field-dirty-record.service';
import { type StoredFormulaWatchPlans } from 'src/engine/core-modules/stored-formula-field/types/stored-formula-watch-plans.type';
import { findStaleStoredFormulaRecordIdsByObjectMetadataId } from 'src/engine/core-modules/stored-formula-field/utils/find-stale-stored-formula-record-ids-by-object-metadata-id.util';
import { getStoredFormulaWatchPlans } from 'src/engine/core-modules/stored-formula-field/utils/get-stored-formula-watch-plans.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { OnDatabaseBatchEvent } from 'src/engine/workspace-event-emitter/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/workspace-event-emitter/enums/database-event-action';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

type RecordEventBatch = Pick<
  WorkspaceEventBatch<ObjectRecordBaseEvent<Record<string, unknown>>>,
  'workspaceId' | 'objectMetadata' | 'events'
>;

@Injectable()
export class StoredFormulaFieldRecordEventListener {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly storedFormulaFieldDirtyRecordService: StoredFormulaFieldDirtyRecordService,
  ) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.CREATED)
  @OnDatabaseBatchEvent('*', DatabaseEventAction.RESTORED)
  async handleRecordsAdded(batch: RecordEventBatch): Promise<void> {
    const watchPlans = await this.getWatchPlans(batch.workspaceId);

    // A new or restored record has stored formulas that were never computed, or went stale while it was deleted
    await this.markOwnRecordsDirty({
      ...batch,
      watchPlans,
      isRecordUpdate: false,
    });
    await this.markRelatedRecordsDirty({
      ...batch,
      watchPlans,
      isRecordUpdate: false,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DELETED)
  @OnDatabaseBatchEvent('*', DatabaseEventAction.DESTROYED)
  async handleRecordsRemoved(batch: RecordEventBatch): Promise<void> {
    await this.markRelatedRecordsDirty({
      ...batch,
      watchPlans: await this.getWatchPlans(batch.workspaceId),
      isRecordUpdate: false,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPDATED)
  async handleRecordsUpdated(batch: RecordEventBatch): Promise<void> {
    const watchPlans = await this.getWatchPlans(batch.workspaceId);

    await this.markOwnRecordsDirty({
      ...batch,
      watchPlans,
      isRecordUpdate: true,
    });
    await this.markRelatedRecordsDirty({
      ...batch,
      watchPlans,
      isRecordUpdate: true,
    });
  }

  private async markOwnRecordsDirty({
    workspaceId,
    objectMetadata,
    events,
    watchPlans: { watchedOwnFieldNamesByObjectMetadataId },
    isRecordUpdate,
  }: RecordEventBatch & {
    watchPlans: StoredFormulaWatchPlans;
    isRecordUpdate: boolean;
  }): Promise<void> {
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
            watchedOwnFieldNames.includes(fieldName),
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
  }: RecordEventBatch & {
    watchPlans: StoredFormulaWatchPlans;
    isRecordUpdate: boolean;
  }): Promise<void> {
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

  private async getWatchPlans(
    workspaceId: string,
  ): Promise<StoredFormulaWatchPlans> {
    return getStoredFormulaWatchPlans(
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMapsOrm',
      ]),
    );
  }
}
