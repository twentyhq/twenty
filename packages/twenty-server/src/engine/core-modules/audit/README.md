# Analytics Module

This module provides analytics tracking functionality for the Twenty application.

## Usage

### Tracking Events

The `AuditService` provides a `createContext` method that returns an object with three methods:

- `insertWorkspaceEvent`: For tracking workspace-level events
- `createObjectEvent`: For tracking object-level events that include record and metadata IDs
- `createPageviewEvent`: For tracking page views

```typescript
import { Injectable } from '@nestjs/common';
import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/track/custom-domain/custom-domain-activated';

@Injectable()
export class MyService {
  constructor(private readonly auditService: AuditService) {}

  async doSomething() {
    // Create an analytics context
    const auditService = this.auditService.createContext({
      workspaceId: 'workspace-id',
      userId: 'user-id',
    });

    // Track a workspace event
    auditService.insertWorkspaceEvent(CUSTOM_DOMAIN_ACTIVATED_EVENT, {});
    
    // Track an object event
    auditService.createObjectEvent(OBJECT_RECORD_CREATED_EVENT, {
      recordId: 'record-id',
      objectMetadataId: 'object-metadata-id',
      // other properties
    });
    
    // Track a pageview
    auditService.createPageviewEvent('page-name', {
      href: '/path',
      locale: 'en-US',
      // other properties
    });
  }
}
```

### Adding New Events

To add a new event:

1. Create a new file in the `src/engine/core-modules/analytics/utils/events/track` directory
2. Define the event name, schema, and type
3. Register the event using the `registerEvent` function
4. Update the `TrackEventName` and `TrackEventProperties` types in `src/engine/core-modules/analytics/utils/events/event-types.ts`

Example:

```typescript
// src/engine/core-modules/analytics/utils/events/track/my-feature/my-event.ts
import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/analytics/utils/events/track/track';

export const MY_EVENT = 'My Event' as const;
export const myEventSchema = z.object({
  event: z.literal(MY_EVENT),
  properties: z.object({
    myProperty: z.string(),
  }),
});

export type MyEventTrackEvent = z.infer<typeof myEventSchema>;

registerEvent(MY_EVENT, myEventSchema);
```

Then update the `events.type.ts` file:

```typescript
// src/engine/core-modules/analytics/types/events.type.ts
import { MY_EVENT, MyEventTrackEvent } from '../utils/events/track/my-feature/my-event';

// Add to the union type
export type TrackEventName = 
  | typeof MY_EVENT
  // ... other event names;

// Add to the TrackEvents interface
export interface TrackEvents {
  [MY_EVENT]: MyEventTrackEvent;
  // ... other event types
}

// The TrackEventProperties type will automatically use the new event
export type TrackEventProperties<T extends TrackEventName> = T extends keyof TrackEvents
  ? TrackEvents[T]['properties']
  : object;
```

## API

### AuditService

#### createContext(context?)

Creates an analytics context with the given user ID and workspace ID.

- `context` (optional): An object with `userId` and `workspaceId` properties

Returns an object with the following methods:

- `insertWorkspaceEvent<T extends TrackEventName>(event: T, properties: TrackEventProperties<T>)`: Tracks a workspace-level event
- `createObjectEvent<T extends TrackEventName>(event: T, properties: TrackEventProperties<T> & { recordId: string; objectMetadataId: string })`: Tracks an object-level event
- `createPageviewEvent(name: string, properties: Partial<PageviewProperties>)`: Tracks a pageview

### Types

#### TrackEventName

A union type of all registered event names, plus `string` for backward compatibility.

#### TrackEventProperties<T>

A mapped type that maps each event name to its corresponding properties type. It uses the `TrackEvents` interface to provide a more maintainable and type-safe way to map event names to their properties.

```typescript
// Define the mapping between event names and their event types
export interface TrackEvents {
  [EVENT_NAME_1]: Event1Type;
  [EVENT_NAME_2]: Event2Type;
  // ... other event types
}

// Use the mapping to extract properties for each event type
export type TrackEventProperties<T extends TrackEventName> = T extends keyof TrackEvents
  ? TrackEvents[T]['properties']
  : object;
```

This approach makes it easier to add new events without having to modify a complex nested conditional type.

#### PageviewProperties

Properties for pageview events, including href, locale, pathname, referrer, sessionId, timeZone, and userAgent.
