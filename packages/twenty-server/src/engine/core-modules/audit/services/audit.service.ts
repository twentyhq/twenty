import { Injectable } from '@nestjs/common';

import { WorkspaceEventSinkService } from 'src/engine/core-modules/audit/services/workspace-event-sink.service';
import {
  type TrackEventName,
  type TrackEventProperties,
} from 'src/engine/core-modules/audit/types/events.type';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';
import {
  buildObjectEventEnvelope,
  buildPageviewEnvelope,
  buildWorkspaceEventEnvelope,
  computeEventContextFields,
} from 'src/engine/core-modules/audit/utils/build-event-envelope';
import { type PageviewProperties } from 'src/engine/core-modules/audit/utils/events/pageview/pageview';

// Typed emit facade for analytics events. Builds an envelope and hands it to the
// unified pipeline; the ClickHouse write lives in the sinks.
@Injectable()
export class AuditService {
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
    await this.workspaceEventSinkService.enqueue([envelope]);

    return { success: true };
  }
}
