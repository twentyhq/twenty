import { Injectable, Logger } from '@nestjs/common';

import { WorkspaceEventSinkService } from 'src/engine/core-modules/event-logs/ingest/workspace-event-sink.service';
import {
  type TrackEventName,
  type TrackEventProperties,
} from 'src/engine/core-modules/event-logs/emit/events.type';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';
import {
  buildObjectEventEnvelope,
  buildPageviewEnvelope,
  buildWorkspaceEventEnvelope,
  computeEventContextFields,
} from 'src/engine/core-modules/event-logs/emit/build-event-envelope';
import { type PageviewProperties } from 'src/engine/core-modules/event-logs/emit/events/pageview/pageview';

// Typed emit facade: building (schema validation) + enqueuing are best-effort and never crash the caller.
@Injectable()
export class EventLogEmitterService {
  private readonly logger = new Logger(EventLogEmitterService.name);

  constructor(
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
      await this.workspaceEventSinkService.enqueue([buildEnvelope()]);

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to emit workspace event', error);

      return { success: false };
    }
  }
}
