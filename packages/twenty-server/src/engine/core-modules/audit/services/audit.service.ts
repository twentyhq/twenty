import { Injectable } from '@nestjs/common';

import { WorkspaceEventsConsumer } from 'src/engine/core-modules/audit/jobs/workspace-events.consumer';
import { WorkspaceEventSinkService } from 'src/engine/core-modules/audit/services/workspace-event-sink.service';
import {
  type TrackEventName,
  type TrackEventProperties,
} from 'src/engine/core-modules/audit/types/events.type';
import {
  type WorkspaceEventEnvelope,
  type WorkspaceEventsJobData,
} from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';
import {
  buildObjectEventEnvelope,
  buildPageviewEnvelope,
  buildWorkspaceEventEnvelope,
  computeEventContextFields,
} from 'src/engine/core-modules/audit/utils/build-event-envelope';
import { type PageviewProperties } from 'src/engine/core-modules/audit/utils/events/pageview/pageview';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

// Typed emit facade for analytics events. Builds an envelope and enqueues it
// onto the unified workspace-events pipeline; the ClickHouse write lives in the
// sinks.
@Injectable()
export class AuditService {
  constructor(
    @InjectMessageQueue(MessageQueue.workspaceEventsQueue)
    private readonly workspaceEventsQueueService: MessageQueueService,
    private readonly workspaceEventSinkService: WorkspaceEventSinkService,
  ) {}

  createContext(context?: {
    workspaceId?: string | null | undefined;
    userId?: string | null | undefined;
  }) {
    const contextFields = computeEventContextFields(context);

    return {
      insertWorkspaceEvent: <T extends TrackEventName>(
        event: T,
        properties: TrackEventProperties<T>,
      ) =>
        this.enqueue(
          buildWorkspaceEventEnvelope(contextFields, event, properties),
        ),
      createObjectEvent: <T extends TrackEventName>(
        event: T,
        properties: TrackEventProperties<T> & {
          recordId: string;
          objectMetadataId: string;
          isCustom?: boolean;
        },
      ) =>
        this.enqueue(
          buildObjectEventEnvelope(contextFields, event, properties),
        ),
      createPageviewEvent: (
        name: string,
        properties: Partial<PageviewProperties>,
      ) => this.enqueue(buildPageviewEnvelope(contextFields, name, properties)),
    };
  }

  private async enqueue(
    envelope: WorkspaceEventEnvelope,
  ): Promise<{ success: boolean }> {
    if (!this.workspaceEventSinkService.isEnabled()) {
      return { success: true };
    }

    await this.workspaceEventsQueueService.add<WorkspaceEventsJobData>(
      WorkspaceEventsConsumer.name,
      { events: [envelope] },
    );

    return { success: true };
  }
}
