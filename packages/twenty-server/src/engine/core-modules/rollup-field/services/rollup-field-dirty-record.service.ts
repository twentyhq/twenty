import { Injectable } from '@nestjs/common';

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
    await this.scheduleRecompute({ workspaceId, objectMetadataId });
  }

  async popDirtyRecordIds({
    workspaceId,
    objectMetadataId,
    size,
  }: RecomputeDirtyRollupRecordsJobData & { size: number }): Promise<string[]> {
    return this.cacheStorageService.setPop(
      this.getDirtyRecordIdsKey({ workspaceId, objectMetadataId }),
      size,
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

  private getDirtyRecordIdsKey({
    workspaceId,
    objectMetadataId,
  }: RecomputeDirtyRollupRecordsJobData): string {
    return `dirty-record-ids:${workspaceId}:${objectMetadataId}`;
  }
}
