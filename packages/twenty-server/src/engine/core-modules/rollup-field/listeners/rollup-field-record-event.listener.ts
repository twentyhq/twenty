import { Injectable } from '@nestjs/common';

import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type RollupFieldWatchPlans } from 'src/engine/core-modules/rollup-field/types/rollup-field-watch-plan.type';
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
    const watchPlans = await this.getWatchPlans(batch.workspaceId);

    await this.markRecordsHoldingRollupsDirty({ ...batch, watchPlans });
    await this.markRecordsAggregatingEventsDirty({
      ...batch,
      watchPlans,
      isRecordUpdate: false,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DELETED)
  @OnDatabaseBatchEvent('*', DatabaseEventAction.DESTROYED)
  async handleRecordsRemoved(batch: RecordEventBatch): Promise<void> {
    await this.markRecordsAggregatingEventsDirty({
      ...batch,
      watchPlans: await this.getWatchPlans(batch.workspaceId),
      isRecordUpdate: false,
    });
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPDATED)
  async handleRecordsUpdated(batch: RecordEventBatch): Promise<void> {
    await this.markRecordsAggregatingEventsDirty({
      ...batch,
      watchPlans: await this.getWatchPlans(batch.workspaceId),
      isRecordUpdate: true,
    });
  }

  // A new or restored record has rollups of its own that were never computed, or went stale while it was deleted
  private async markRecordsHoldingRollupsDirty({
    workspaceId,
    objectMetadata,
    events,
    watchPlans: { objectMetadataIdsWithRollups },
  }: RecordEventBatch & { watchPlans: RollupFieldWatchPlans }): Promise<void> {
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
    watchPlans: { watchPlansByChildObjectMetadataId },
    isRecordUpdate,
  }: RecordEventBatch & {
    watchPlans: RollupFieldWatchPlans;
    isRecordUpdate: boolean;
  }): Promise<void> {
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

    await Promise.all(
      Object.entries(dirtyRecordIdsByObjectMetadataId).map(
        ([objectMetadataId, recordIds]) =>
          this.rollupFieldDirtyRecordService.markRecordsDirty({
            workspaceId,
            objectMetadataId,
            recordIds,
          }),
      ),
    );
  }

  private async getWatchPlans(
    workspaceId: string,
  ): Promise<RollupFieldWatchPlans> {
    return getRollupFieldWatchPlans(
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMapsOrm',
      ]),
    );
  }
}
