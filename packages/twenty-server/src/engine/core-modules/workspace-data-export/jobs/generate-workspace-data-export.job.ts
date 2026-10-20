import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { type MessageQueueJobContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  GENERATE_WORKSPACE_DATA_EXPORT_JOB_NAME,
  WORKSPACE_DATA_EXPORT_MAX_DURATION_MS,
} from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import {
  type WorkspaceDataExportJobData,
  WorkspaceDataExportService,
} from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export.service';

@Processor(MessageQueue.workspaceDataExportQueue)
export class GenerateWorkspaceDataExportJob {
  constructor(
    private readonly workspaceDataExportService: WorkspaceDataExportService,
  ) {}

  @Process(GENERATE_WORKSPACE_DATA_EXPORT_JOB_NAME)
  async handle(
    data: WorkspaceDataExportJobData,
    { abortSignal }: MessageQueueJobContext,
  ): Promise<void> {
    await this.workspaceDataExportService.generate({
      ...data,
      abortSignal: AbortSignal.any([
        AbortSignal.timeout(WORKSPACE_DATA_EXPORT_MAX_DURATION_MS),
        ...(isDefined(abortSignal) ? [abortSignal] : []),
      ]),
    });
  }
}
