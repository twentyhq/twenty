# Event Logs

This module records workspace events, object events, pageviews, and application logs, persists them to ClickHouse, and exposes them for reading and live streaming.

## Emitting events

Inject `EventLogEmitterService` and call `createContext()` to get a context bound to a workspace (and optionally a user). The context exposes three emit methods:

- `insertWorkspaceEvent(event, properties)` — workspace-level events
- `createObjectEvent(event, properties)` — events tied to a record (`recordId` + `objectMetadataId`)
- `createPageviewEvent(name, properties)` — pageviews

```typescript
import { Injectable } from '@nestjs/common';

import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/custom-domain/custom-domain-activated';

@Injectable()
export class MyService {
  constructor(private readonly eventLogEmitterService: EventLogEmitterService) {}

  async doSomething(workspaceId: string) {
    const eventLogContext = this.eventLogEmitterService.createContext({
      workspaceId,
    });

    // Emitting is best-effort and never throws into the caller, so it can be
    // fire-and-forget.
    void eventLogContext.insertWorkspaceEvent(CUSTOM_DOMAIN_ACTIVATED_EVENT, {});
  }
}
```

Emitting only builds and enqueues the event (schema validation + a queue job). Persistence happens later in the worker, so `createContext()` does no work when no sink is configured (`isEnabled()` is false).

## Adding a new event

Events live under `emit/events/<group>/<name>.ts`, where `<group>` is `workspace-event`, `object-event`, or `pageview`.

1. Create the file, define the event name constant and a Zod schema, and register it with `registerEvent`.
2. Add the event name and type to the `TrackEventName` union and `TrackEvents` map in `emit/events.type.ts`.

```typescript
// emit/events/workspace-event/my-feature/my-event.ts
import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/track';

export const MY_EVENT = 'My Event' as const;

export const myEventSchema = z.strictObject({
  event: z.literal(MY_EVENT),
  properties: z.strictObject({
    myProperty: z.string(),
  }),
});

export type MyEventTrackEvent = z.infer<typeof myEventSchema>;

registerEvent(MY_EVENT, myEventSchema);
```

## Structure

The module is split by responsibility:

- `emit/` — the producer-facing `EventLogEmitterService`, the event definitions, and their registry (`eventsRegistry` in `emit/events/workspace-event/track.ts`).
- `ingest/` — the worker-side consumer and the sinks (ClickHouse, console) that persist enqueued events.
- `live/` — presence-gated live fan-out: subscribers mark `(workspace, table)` watched with a heartbeat-refreshed TTL, and the consumer only publishes to watched tables.
- viewer — the read API (`event-logs.service.ts`, `event-logs.resolver.ts`, `event-logs-live.resolver.ts`) that queries ClickHouse and streams updates.

`registry/event-log-registry.ts` holds `EVENT_LOG_TYPES`, the per-type source of truth keyed by `EventLogTable`: the ClickHouse table (also its live presence key), the billing entitlement required to read it, the free-text filter field, and how a stored row maps to a GraphQL record. Adding a new event-log type is one entry here (plus a ClickHouse migration).
