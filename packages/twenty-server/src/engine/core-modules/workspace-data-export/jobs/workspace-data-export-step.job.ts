import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WORKSPACE_DATA_EXPORT_STEP_JOB_NAME } from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { WorkspaceDataExportStepService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export-step.service';
import { type WorkspaceDataExportJobData } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-job-data.type';

@Processor(MessageQueue.workspaceDataExportQueue)
export class WorkspaceDataExportStepJob {
  constructor(
    private readonly workspaceDataExportStepService: WorkspaceDataExportStepService,
  ) {}

  @Process(WORKSPACE_DATA_EXPORT_STEP_JOB_NAME)
  async handle(
    data: WorkspaceDataExportJobData,
    { abortSignal }: MessageQueueJobContext,
  ): Promise<void> {
    await this.workspaceDataExportStepService.runStep({ ...data, abortSignal });
  }
}
