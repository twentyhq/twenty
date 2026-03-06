import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { MetadataEventBatch } from 'src/engine/metadata-event-emitter/types/metadata-event-batch.type';
import { computeMetadataEventName } from 'src/engine/metadata-event-emitter/utils/compute-metadata-event-name.util';
import {
  AllMetadataEventName,
  AllMetadataEventType,
  MetadataEvent,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

type EmitMetadataEventsArgs = {
  metadataEvents: MetadataEvent[];
  workspaceId: string;
  initiatorContext?: WorkspaceAuthContext;
};

@Injectable()
export class MetadataEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  public emitMetadataEvents({
    metadataEvents,
    workspaceId,
    initiatorContext,
  }: EmitMetadataEventsArgs): void {
    if (metadataEvents.length === 0) {
      return;
    }

    const resolvedInitiatorContext =
      this.resolveInitiatorContext(initiatorContext);

    const userId =
      resolvedInitiatorContext?.type === 'user' ||
      resolvedInitiatorContext?.type === 'pendingActivationUser'
        ? resolvedInitiatorContext.user.id
        : undefined;
    const apiKeyId =
      resolvedInitiatorContext?.type === 'apiKey'
        ? resolvedInitiatorContext.apiKey.id
        : undefined;

    const grouped = this.groupByMetadataNameAndAction(metadataEvents);

    for (const { eventName, events, metadataName, type } of grouped.values()) {
      if (metadataEvents.length === 0) {
        continue;
      }

      const metadataEventBatch: MetadataEventBatch = {
        name: eventName,
        workspaceId,
        metadataName,
        type,
        events,
        userId,
        apiKeyId,
      };

      this.eventEmitter.emit(eventName, metadataEventBatch);
    }
  }

  private resolveInitiatorContext(
    initiatorContext?: WorkspaceAuthContext,
  ): WorkspaceAuthContext | undefined {
    if (isDefined(initiatorContext)) {
      return initiatorContext;
    }

    try {
      return getWorkspaceAuthContext();
    } catch {
      return undefined;
    }
  }

  private groupByMetadataNameAndAction(metadataEvents: MetadataEvent[]) {
    const grouped = new Map<
      AllMetadataEventName,
      {
        metadataName: AllMetadataName;
        type: AllMetadataEventType;
        eventName: AllMetadataEventName;
        events: MetadataEvent[];
      }
    >();

    for (const metadataEvent of metadataEvents) {
      const { metadataName, type } = metadataEvent;
      const eventName = computeMetadataEventName({
        metadataName,
        type,
      });
      const occurence = grouped.get(eventName);

      if (!isDefined(occurence)) {
        grouped.set(eventName, {
          eventName,
          metadataName,
          type,
          events: [metadataEvent],
        });
        continue;
      }

      grouped.set(eventName, {
        ...occurence,
        events: [...occurence.events, metadataEvent],
      });
    }

    return grouped;
  }
}
