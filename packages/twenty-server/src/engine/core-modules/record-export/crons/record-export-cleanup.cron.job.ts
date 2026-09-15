import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, LessThan, Repository } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { RecordExportEntity } from 'src/engine/core-modules/record-export/record-export.entity';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';

@Processor(MessageQueue.cronQueue)
export class RecordExportCleanupCronJob {
  private readonly logger = new Logger(RecordExportCleanupCronJob.name);

  constructor(
    // oxlint-disable-next-line twenty/prefer-workspace-scoped-repository -- cleanup sweeps expired exports across workspaces.
    @InjectRepository(RecordExportEntity)
    private readonly recordExportRepository: Repository<RecordExportEntity>,
    private readonly recordExportWorkspaceService: RecordExportWorkspaceService,
  ) {}

  @Process(RecordExportCleanupCronJob.name)
  async handle(): Promise<void> {
    const exports = await this.recordExportRepository.find({
      where: [
        { expiresAt: LessThan(new Date()) },
        {
          status: In([
            RecordExportStatus.QUEUED,
            RecordExportStatus.PROCESSING,
          ]),
          createdAt: LessThan(new Date(Date.now() - 60_000)),
        },
      ],
      order: { createdAt: 'ASC' },
      take: 100,
    });

    for (const recordExport of exports) {
      try {
        await this.recordExportWorkspaceService.reconcile(recordExport);
        if (recordExport.expiresAt.getTime() > Date.now()) continue;

        await this.recordExportWorkspaceService.deleteFiles(recordExport);
        await this.recordExportRepository.delete({
          id: recordExport.id,
          workspaceId: recordExport.workspaceId,
        });
      } catch {
        this.logger.warn(`Failed to clean up export ${recordExport.id}`);
      }
    }
  }
}
