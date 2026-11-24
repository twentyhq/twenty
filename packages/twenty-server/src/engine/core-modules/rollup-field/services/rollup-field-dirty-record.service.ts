import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RECOMPUTE_DIRTY_ROLLUP_RECORDS_JOB_NAME } from 'src/engine/core-modules/rollup-field/constants/recompute-dirty-rollup-records-job-name.constant';
import { ROLLUP_FIELD_RECOMPUTE_DEBOUNCE_MS } from 'src/engine/core-modules/rollup-field/constants/rollup-field-recompute-debounce-ms.constant';
import { type RecomputeDirtyRollupRecordsJobData } from 'src/engine/core-modules/rollup-field/types/recompute-dirty-rollup-records-job-data.type';

@Injectable()
export class RollupFieldDirtyRecordService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineRollupField)
    private readonly cacheStorageService: CacheStorageService,
    @InjectMessageQueue(MessageQueue.rollupFieldQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async markRecordsDirty({
    workspaceId,
    objectMetadataId,
    recordIds,
  }: RecomputeDirtyRollupRecordsJobData & {
    recordIds: string[];
  }): Promise<void> {
    if (recordIds.length === 0) {
      return;
    }

    await this.cacheStorageService.setAdd(
      this.getDirtyRecordIdsKey({ workspaceId, objectMetadataId }),
      recordIds,
    );

    // Saves the enqueue round trips on every batch while a recompute is pending
    const scheduledMarker = await this.cacheStorageService.acquireLock({
      key: this.getRecomputeScheduledKey({ workspaceId, objectMetadataId }),
      ttl: ROLLUP_FIELD_RECOMPUTE_DEBOUNCE_MS,
    });

    if (isDefined(scheduledMarker)) {
      await this.scheduleRecompute({ workspaceId, objectMetadataId });
    }
  }

  async popDirtyRecordIds({
    workspaceId,
    objectMetadataId,
    size,
  }: RecomputeDirtyRollupRecordsJobData & { size: number }): Promise<string[]> {
    const dirtyRecordIdsKey = this.getDirtyRecordIdsKey({
      workspaceId,
      objectMetadataId,
    });
    const processingRecordIdsKey = this.getProcessingRecordIdsKey({
      workspaceId,
      objectMetadataId,
    });

    // Cleared before popping so ids added from now on schedule another run
    await this.cacheStorageService.del(
      this.getRecomputeScheduledKey({ workspaceId, objectMetadataId }),
    );

    // Ids left by a run that died before completing go back in the queue
    const unfinishedRecordIds = await this.cacheStorageService.setMembers(
      processingRecordIdsKey,
    );

    if (isNonEmptyArray(unfinishedRecordIds)) {
      await this.cacheStorageService.setAdd(
        dirtyRecordIdsKey,
        unfinishedRecordIds,
      );
      await this.cacheStorageService.del(processingRecordIdsKey);
    }

    const recordIds = await this.cacheStorageService.setPop(
      dirtyRecordIdsKey,
      size,
    );

    await this.cacheStorageService.setAdd(processingRecordIdsKey, recordIds);

    return recordIds;
  }

  async completeDirtyRecordIds({
    workspaceId,
    objectMetadataId,
    recordIds,
  }: RecomputeDirtyRollupRecordsJobData & {
    recordIds: string[];
  }): Promise<void> {
    await this.cacheStorageService.setRemove(
      this.getProcessingRecordIdsKey({ workspaceId, objectMetadataId }),
      recordIds,
    );
  }

  async scheduleRecompute({
    workspaceId,
    objectMetadataId,
  }: RecomputeDirtyRollupRecordsJobData): Promise<void> {
    await this.messageQueueService.add<RecomputeDirtyRollupRecordsJobData>(
      RECOMPUTE_DIRTY_ROLLUP_RECORDS_JOB_NAME,
      { workspaceId, objectMetadataId },
      {
        delay: ROLLUP_FIELD_RECOMPUTE_DEBOUNCE_MS,
        deduplication: {
          id: `rollup-field-recompute:${workspaceId}:${objectMetadataId}`,
          keepLastIfActive: true,
        },
        workspaceId,
        isWorkspaceJob: true,
      },
    );
  }

  private getRecomputeScheduledKey({
    workspaceId,
    objectMetadataId,
  }: RecomputeDirtyRollupRecordsJobData): string {
    return `recompute-scheduled:${workspaceId}:${objectMetadataId}`;
  }

  private getProcessingRecordIdsKey({
    workspaceId,
    objectMetadataId,
  }: RecomputeDirtyRollupRecordsJobData): string {
    return `processing-record-ids:${workspaceId}:${objectMetadataId}`;
  }

  private getDirtyRecordIdsKey({
    workspaceId,
    objectMetadataId,
  }: RecomputeDirtyRollupRecordsJobData): string {
    return `dirty-record-ids:${workspaceId}:${objectMetadataId}`;
  }
}
