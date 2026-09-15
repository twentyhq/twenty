import { RecordExportException } from 'src/engine/core-modules/record-export/record-export.exception';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RECORD_EXPORT_CLEANUP_JOB_OPTIONS } from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';
import { isDefined } from 'twenty-shared/utils';
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
  ) {}

  @Process(DeleteRecordExportJob.name)
  async handle({
    workspaceId,
    recordExportId,
  }: {
    workspaceId: string;
    recordExportId: string;
  }): Promise<void> {
    const recordExport = await this.recordExportCacheService.findOne({
      workspaceId,
      id: recordExportId,
    });
    if (isDefined(recordExport)) {
      const cleanupJobId = await this.messageQueueService.add(
        DeleteRecordExportJob.name,
        { workspaceId, recordExportId },
        {
          ...RECORD_EXPORT_CLEANUP_JOB_OPTIONS,
          id: recordExportId,
          allowDuplicatedPrefixes: true,
        },
      );
      if (!isDefined(cleanupJobId)) {
        throw new RecordExportException(
          'Export cleanup could not be queued',
          'QUEUE_UNAVAILABLE',
        );
      }
      return;
    }
    await this.recordExportWorkspaceService.cancel({
      workspaceId,
      id: recordExportId,
    });
  }
}
