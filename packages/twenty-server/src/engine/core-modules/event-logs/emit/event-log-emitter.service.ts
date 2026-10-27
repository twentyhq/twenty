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
import { WorkspaceEventSinkService } from 'src/engine/core-modules/event-logs/ingest/workspace-event-sink.service';
import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { buildApplicationLogEnvelopes } from 'src/engine/core-modules/event-logs/producers/application-log/build-application-log-envelopes';
import { type ApplicationMetricEvent } from 'src/engine/core-modules/event-logs/producers/application-metric-event/application-metric-event.type';
import { buildApplicationMetricEventEnvelopes } from 'src/engine/core-modules/event-logs/producers/application-metric-event/build-application-metric-event-envelopes';
import { toApplicationMetricEvent } from 'src/engine/core-modules/event-logs/producers/application-metric-event/to-application-metric-event';
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

  async recordApplicationLogs(entries: ApplicationLogEntry[]): Promise<void> {
    await this.dispatchOrLogError(() => buildApplicationLogEnvelopes(entries));
  }

  async recordApplicationMetricEvents(
    events: ApplicationMetricEvent[],
  ): Promise<void> {
    await this.dispatchOrLogError(() =>
      buildApplicationMetricEventEnvelopes(events),
    );
  }

  async recordApplicationPlatformEvents(
    entries: ApplicationLogEntry[],
  ): Promise<void> {
    await this.dispatchOrLogError(() => [
      ...buildApplicationLogEnvelopes(entries),
      ...buildApplicationMetricEventEnvelopes(
        entries.map(toApplicationMetricEvent),
      ),
    ]);
  }

  private async dispatchOrLogError(
    buildEnvelopes: () => WorkspaceEventEnvelope[],
  ): Promise<void> {
    try {
      await this.dispatch(buildEnvelopes());
    } catch (error) {
      this.logger.error('Failed to record application events', error);
    }
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
