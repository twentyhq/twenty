import { WorkspaceEventSinkService } from 'src/engine/core-modules/audit/services/workspace-event-sink.service';
import {
  WORKSPACE_EVENTS_JOB_NAME,
  type WorkspaceEventsJobData,
} from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.workspaceEventsQueue)
export class WorkspaceEventsConsumer {
  constructor(
    private readonly workspaceEventSinkService: WorkspaceEventSinkService,
  ) {}

  @Process(WORKSPACE_EVENTS_JOB_NAME)
  async handle(data: WorkspaceEventsJobData): Promise<void> {
    await this.workspaceEventSinkService.ingest(data.events);
  }
}
