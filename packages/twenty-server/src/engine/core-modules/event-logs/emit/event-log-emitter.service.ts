import { Injectable, Logger } from '@nestjs/common';
import { type ApplicationMonitoringEvent } from 'twenty-shared/application';

import {
  buildObjectEventEnvelope,
  buildPageviewEnvelope,
  buildWorkspaceEventEnvelope,
  computeEventContextFields,
} from 'src/engine/core-modules/event-logs/emit/build-event-envelope';
import {
  type TrackEventName,
  type TrackEventProperties,
} from 'src/engine/core-modules/event-logs/emit/events.type';
import { type PageviewProperties } from 'src/engine/core-modules/event-logs/emit/events/pageview/pageview';
import { WorkspaceEventSinkService } from 'src/engine/core-modules/event-logs/ingest/workspace-event-sink.service';
import { buildApplicationLogEnvelopes } from 'src/engine/core-modules/event-logs/producers/application-log/build-application-log-envelopes';
import {
  type EventContextFields,
  type WorkspaceEventEnvelope,
} from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';

@Injectable()
export class EventLogEmitterService {
  private readonly logger = new Logger(EventLogEmitterService.name);

  constructor(
    private readonly workspaceEventSinkService: WorkspaceEventSinkService,
  ) {}

  isEnabled(): boolean {
    return this.workspaceEventSinkService.isEnabled();
  }

  async dispatch(events: WorkspaceEventEnvelope[]): Promise<void> {
    if (events.length === 0 || !this.isEnabled()) {
      return;
    }

    await this.workspaceEventSinkService.ingest(events);
  }

  async emitApplicationEvent({
    event,
    workspaceId,
    applicationId,
    applicationRegistrationId,
    message,
    properties = {},
  }: {
    event: ApplicationMonitoringEvent;
    workspaceId: string;
    applicationId?: string;
    applicationRegistrationId?: string | null;
    message: string;
    properties?: Record<string, unknown>;
  }): Promise<{ success: boolean }> {
    return this.emit(
      () =>
        buildApplicationLogEnvelopes([
          {
            timestamp: new Date(),
            workspaceId,
            // Failed first installs have no installation ID yet.
            applicationId: applicationId ?? applicationRegistrationId ?? '',
            logicFunctionId: '',
            logicFunctionName: event,
            executionId: '',
            level:
              event.endsWith('.failed') || event.endsWith('.unreachable')
                ? 'ERROR'
                : event.endsWith('.rate_limited')
                  ? 'WARN'
                  : 'INFO',
            message,
            properties: {
              ...properties,
              eventType: event,
              applicationRegistrationId,
            },
          },
        ])[0],
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
      await this.dispatch([buildEnvelope()]);

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to emit workspace event', error);

      return { success: false };
    }
  }
}
