import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RECOMPUTE_DIRTY_STORED_FORMULA_RECORDS_JOB_NAME } from 'src/engine/core-modules/stored-formula-field/constants/recompute-dirty-stored-formula-records-job-name.constant';
import { STORED_FORMULA_FIELD_RECOMPUTE_DEBOUNCE_MS } from 'src/engine/core-modules/stored-formula-field/constants/stored-formula-field-recompute-debounce-ms.constant';
import { type RecomputeDirtyStoredFormulaRecordsJobData } from 'src/engine/core-modules/stored-formula-field/types/recompute-dirty-stored-formula-records-job-data.type';

@Injectable()
export class StoredFormulaFieldDirtyRecordService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineStoredFormulaField)
    private readonly cacheStorageService: CacheStorageService,
    @InjectMessageQueue(MessageQueue.storedFormulaFieldQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async markRecordsDirty({
    workspaceId,
    objectMetadataId,
    recordIds,
  }: RecomputeDirtyStoredFormulaRecordsJobData & {
    recordIds: string[];
  }): Promise<void> {
    if (!isNonEmptyArray(recordIds)) {
      return;
    }

    await this.cacheStorageService.setAdd(
      this.getKey('dirty-record-ids', { workspaceId, objectMetadataId }),
      recordIds,
    );

    // Saves the enqueue round trips on every batch while a recompute is pending
    const isFirstMarkSinceLastRun = await this.cacheStorageService.setIfAbsent(
      this.getKey('recompute-scheduled', { workspaceId, objectMetadataId }),
      true,
      STORED_FORMULA_FIELD_RECOMPUTE_DEBOUNCE_MS,
    );

    if (isFirstMarkSinceLastRun) {
      await this.scheduleRecompute({ workspaceId, objectMetadataId });
    }
  }

  async popDirtyRecordIds({
    workspaceId,
    objectMetadataId,
    size,
  }: RecomputeDirtyStoredFormulaRecordsJobData & { size: number }): Promise<
    string[]
  > {
    const dirtyRecordIdsKey = this.getKey('dirty-record-ids', {
      workspaceId,
      objectMetadataId,
    });
    const processingRecordIdsKey = this.getKey('processing-record-ids', {
      workspaceId,
      objectMetadataId,
    });

    // Cleared before popping so ids added from now on schedule another run
    await this.cacheStorageService.del(
      this.getKey('recompute-scheduled', { workspaceId, objectMetadataId }),
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
  }: RecomputeDirtyStoredFormulaRecordsJobData & {
    recordIds: string[];
  }): Promise<void> {
    await this.cacheStorageService.setRemove(
      this.getKey('processing-record-ids', { workspaceId, objectMetadataId }),
      recordIds,
    );
  }

  async scheduleRecompute({
    workspaceId,
    objectMetadataId,
  }: RecomputeDirtyStoredFormulaRecordsJobData): Promise<void> {
    await this.messageQueueService.add<RecomputeDirtyStoredFormulaRecordsJobData>(
      RECOMPUTE_DIRTY_STORED_FORMULA_RECORDS_JOB_NAME,
      { workspaceId, objectMetadataId },
      {
        delay: STORED_FORMULA_FIELD_RECOMPUTE_DEBOUNCE_MS,
        deduplication: {
          id: `stored-formula-field-recompute:${workspaceId}:${objectMetadataId}`,
          keepLastIfActive: true,
        },
        workspaceId,
        isWorkspaceJob: true,
      },
    );
  }

  private getKey(
    prefix:
      | 'dirty-record-ids'
      | 'processing-record-ids'
      | 'recompute-scheduled',
    {
      workspaceId,
      objectMetadataId,
    }: RecomputeDirtyStoredFormulaRecordsJobData,
  ): string {
    return `${prefix}:${workspaceId}:${objectMetadataId}`;
  }
}
