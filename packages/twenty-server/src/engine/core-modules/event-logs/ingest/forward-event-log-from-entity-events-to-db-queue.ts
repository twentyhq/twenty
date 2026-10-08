import {
  CreateEventLogFromInternalEvent,
  type CreateEventLogFromInternalEventData,
} from 'src/engine/core-modules/event-logs/ingest/create-event-log-from-internal-event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Processor(MessageQueue.entityEventsToDbQueue)
export class ForwardEventLogFromEntityEventsToDbQueue {
  constructor(
    @InjectMessageQueue(MessageQueue.eventLogQueue)
    private readonly eventLogQueueService: MessageQueueService,
  ) {}

  @Process(CreateEventLogFromInternalEvent.name)
  async handle(batch: CreateEventLogFromInternalEventData): Promise<void> {
    await this.eventLogQueueService.add<CreateEventLogFromInternalEventData>(
      CreateEventLogFromInternalEvent.name,
      batch,
      { retryLimit: 1 },
    );
  }
}
