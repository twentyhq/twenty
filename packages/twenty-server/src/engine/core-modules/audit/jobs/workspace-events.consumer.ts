import { WorkspaceEventSinkService } from 'src/engine/core-modules/audit/services/workspace-event-sink.service';
import { type WorkspaceEventsJobData } from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

// Single consumer of the unified event pipeline: writes a batch of events to
// every configured sink. Generalizes the per-type writers that used to insert
// into ClickHouse directly.
@Processor(MessageQueue.workspaceEventsQueue)
export class WorkspaceEventsConsumer {
  constructor(
    private readonly workspaceEventSinkService: WorkspaceEventSinkService,
  ) {}

  @Process(WorkspaceEventsConsumer.name)
  async handle(data: WorkspaceEventsJobData): Promise<void> {
    await this.workspaceEventSinkService.write(data.events);
  }
}
