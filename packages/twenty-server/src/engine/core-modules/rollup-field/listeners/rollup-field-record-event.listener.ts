import { Injectable } from '@nestjs/common';

import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { RollupFieldDirtyRecordService } from 'src/engine/core-modules/rollup-field/services/rollup-field-dirty-record.service';
import { findDirtyRollupRecordIdsByObjectMetadataId } from 'src/engine/core-modules/rollup-field/utils/find-dirty-rollup-record-ids-by-object-metadata-id.util';
import { getRollupFieldWatchPlans } from 'src/engine/core-modules/rollup-field/utils/get-rollup-field-watch-plans.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { OnDatabaseBatchEvent } from 'src/engine/workspace-event-emitter/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/workspace-event-emitter/enums/database-event-action';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

type RecordEventBatch = Pick<
  WorkspaceEventBatch<ObjectRecordBaseEvent<Record<string, unknown>>>,
  'workspaceId' | 'objectMetadata' | 'events'
>;

@Injectable()
export class RollupFieldRecordEventListener {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly rollupFieldDirtyRecordService: RollupFieldDirtyRecordService,
  ) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.CREATED)
  @OnDatabaseBatchEvent('*', DatabaseEventAction.RESTORED)
  async handleRecordsAdded(batch: RecordEventBatch): Promise<void> {
    await this.markRecordsHoldingRollupsDirty(batch);
    await this.markRecordsAggregatingEventsDirty({
      ...batch,
      isRecordUpdate: false,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DELETED)
  @OnDatabaseBatchEvent('*', DatabaseEventAction.DESTROYED)
  async handleRecordsRemoved(batch: RecordEventBatch): Promise<void> {
    await this.markRecordsAggregatingEventsDirty({
      ...batch,
      isRecordUpdate: false,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPDATED)
  async handleRecordsUpdated(batch: RecordEventBatch): Promise<void> {
    await this.markRecordsAggregatingEventsDirty({
      ...batch,
      isRecordUpdate: true,
    });
  }

  // A new or restored record has rollups of its own that were never computed, or went stale while it was deleted
  private async markRecordsHoldingRollupsDirty({
    workspaceId,
    objectMetadata,
    events,
  }: RecordEventBatch): Promise<void> {
    const { objectMetadataIdsWithRollups } =
      await this.getWatchPlans(workspaceId);

    if (!objectMetadataIdsWithRollups.includes(objectMetadata.id)) {
      return;
    }

    await this.rollupFieldDirtyRecordService.markRecordsDirty({
      workspaceId,
      objectMetadataId: objectMetadata.id,
      recordIds: events.map(({ recordId }) => recordId),
    });
  }

  private async markRecordsAggregatingEventsDirty({
    workspaceId,
    objectMetadata,
    events,
    isRecordUpdate,
  }: RecordEventBatch & { isRecordUpdate: boolean }): Promise<void> {
    const { watchPlansByChildObjectMetadataId } =
      await this.getWatchPlans(workspaceId);
    const watchPlans = watchPlansByChildObjectMetadataId[objectMetadata.id];

    if (!isDefined(watchPlans)) {
      return;
    }

    const dirtyRecordIdsByObjectMetadataId =
      findDirtyRollupRecordIdsByObjectMetadataId({
        events,
        watchPlans,
        isRecordUpdate,
      });

    for (const [objectMetadataId, recordIds] of Object.entries(
      dirtyRecordIdsByObjectMetadataId,
    )) {
      await this.rollupFieldDirtyRecordService.markRecordsDirty({
        workspaceId,
        objectMetadataId,
        recordIds,
      });
    }
  }

  private async getWatchPlans(workspaceId: string) {
    return getRollupFieldWatchPlans(
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMapsOrm',
      ]),
    );
  }
}
