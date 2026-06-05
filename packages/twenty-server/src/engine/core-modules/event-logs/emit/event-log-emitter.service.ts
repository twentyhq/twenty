import { Injectable, Logger } from '@nestjs/common';

import {
  buildObjectEventEnvelope,
  buildPageviewEnvelope,
  buildWorkspaceEventEnvelope,
  computeEventContextFields,
} from 'src/engine/core-modules/event-logs/emit/build-event-envelope';
import { type PageviewProperties } from 'src/engine/core-modules/event-logs/emit/events/pageview/pageview';
import {
  type TrackEventName,
  type TrackEventProperties,
} from 'src/engine/core-modules/event-logs/emit/events.type';
import { getAvailableSinkNames } from 'src/engine/core-modules/event-logs/ingest/event-sink-availability';
import {
  type EventContextFields,
  type WorkspaceEventEnvelope,
  WORKSPACE_EVENTS_JOB_NAME,
  type WorkspaceEventsJobData,
} from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Producer-facing emit API. Building (schema validation) and enqueuing are best-effort and never crash the caller.
// Persistence happens later in the worker (WorkspaceEventSinkService.ingest), so this depends only on the queue.
@Injectable()
export class EventLogEmitterService {
  private readonly logger = new Logger(EventLogEmitterService.name);

  constructor(
    @InjectMessageQueue(MessageQueue.workspaceEventsQueue)
    private readonly workspaceEventsQueueService: MessageQueueService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  // Config-derived so producers can skip work without constructing sinks; the consumer
  // re-checks the resolved sinks before persisting.
  isEnabled(): boolean {
    return (
      getAvailableSinkNames(this.twentyConfigService.get('EVENT_SINKS'), {
        hasClickhouseUrl: Boolean(
          this.twentyConfigService.get('CLICKHOUSE_URL'),
        ),
      }).length > 0
    );
  }

  async enqueue(events: WorkspaceEventEnvelope[]): Promise<void> {
    if (!this.isEnabled() || events.length === 0) {
      return;
    }

    await this.workspaceEventsQueueService.add<WorkspaceEventsJobData>(
      WORKSPACE_EVENTS_JOB_NAME,
      { events },
    );
  }

  createContext(context?: EventContextFields) {
    const contextFields = computeEventContextFields(context);

    return {
      insertWorkspaceEvent: <T extends TrackEventName>(
        event: T,
        properties: TrackEventProperties<T>,
      ) =>
        this.emit(() =>
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
        this.emit(() =>
          buildObjectEventEnvelope(contextFields, event, properties),
        ),
      createPageviewEvent: (
        name: string,
        properties: Partial<PageviewProperties>,
      ) =>
        this.emit(() => buildPageviewEnvelope(contextFields, name, properties)),
    };
  }

  private async emit(
    buildEnvelope: () => WorkspaceEventEnvelope,
  ): Promise<{ success: boolean }> {
    try {
      await this.enqueue([buildEnvelope()]);

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to emit workspace event', error);

      return { success: false };
    }
  }
}
