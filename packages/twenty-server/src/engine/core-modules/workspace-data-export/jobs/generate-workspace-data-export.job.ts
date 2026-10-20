import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WORKSPACE_DATA_EXPORT_MAX_DURATION_MS } from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constants';
import {
  type WorkspaceDataExportJobData,
  WorkspaceDataExportService,
} from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export.service';

@Processor(MessageQueue.workspaceQueue)
export class GenerateWorkspaceDataExportJob {
  constructor(
    private readonly workspaceDataExportService: WorkspaceDataExportService,
  ) {}

  @Process(GenerateWorkspaceDataExportJob.name)
  async handle(
    data: WorkspaceDataExportJobData,
    { abortSignal }: MessageQueueJobContext,
  ): Promise<void> {
    await this.workspaceDataExportService.generate(
      data,
      AbortSignal.any([
        AbortSignal.timeout(WORKSPACE_DATA_EXPORT_MAX_DURATION_MS),
        ...(abortSignal ? [abortSignal] : []),
      ]),
    );
  }
}
