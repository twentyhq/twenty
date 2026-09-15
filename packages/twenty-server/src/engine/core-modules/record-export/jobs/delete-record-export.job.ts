import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RECORD_EXPORT_CONNECTION_TTL_MS } from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';
import { isDefined } from 'twenty-shared/utils';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';

@Processor(MessageQueue.cronQueue)
export class DeleteRecordExportJob {
  constructor(
    private readonly recordExportCacheService: RecordExportCacheService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly recordExportWorkspaceService: RecordExportWorkspaceService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Process(DeleteRecordExportJob.name)
  async handle({
    workspaceId,
    recordExportId,
  }: {
    workspaceId: string;
    recordExportId: string;
  }): Promise<void> {
    const recordExport = await this.recordExportCacheService.findOne(
      workspaceId,
      recordExportId,
    );
    if (isDefined(recordExport)) {
      const cleanupJobId = await this.messageQueueService.add(
        DeleteRecordExportJob.name,
        { workspaceId, recordExportId },
        {
          id: recordExportId,
          allowDuplicatedPrefixes: true,
          delay: RECORD_EXPORT_CONNECTION_TTL_MS,
          retryLimit: 10,
          backoff: {
            strategy: 'exponential',
            initialDelayMilliseconds: 60_000,
          },
        },
      );
      if (!isDefined(cleanupJobId))
        throw new Error('Export cleanup could not be queued');
      return;
    }
    await this.fileStorageService.deleteFolderObjects({
      ...this.recordExportWorkspaceService.getFileResource(
        workspaceId,
        recordExportId,
      ),
      folderPath: recordExportId,
    });
  }
}
