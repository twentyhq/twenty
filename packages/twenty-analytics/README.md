# Twenty Analytics

Twenty Analytics is a package for tracking and analyzing user interactions within the Twenty application. It provides a structured way to capture pageviews and custom events, with validation through Zod schemas.

## Features

- Track pageviews with detailed browser and user information
- Create custom events for specific user actions
- Type-safe event creation with TypeScript
- Schema validation using Zod
- Integration with ClickHouse for data storage and analysis

## Usage

### Tracking Pageviews

```typescript
import { makePageview } from 'twenty-analytics';

// Create a pageview event
const pageview = makePageview({
  href: 'https://example.com/dashboard',
  locale: 'en-US',
  pathname: '/dashboard',
  referrer: 'https://example.com/login',
  sessionId: 'session-123',
  timeZone: 'America/New_York',
  userAgent: 'Mozilla/5.0...',
  userId: 'user-123', // Optional
  workspaceId: 'workspace-123', // Optional
});

// Send the pageview to your analytics backend
// ...
```

### Tracking Custom Events

```typescript
import { makeEvent, makeUnsafeEvent } from 'twenty-analytics';
import type { CompanyCreatedEvent } from 'twenty-analytics';

// Type-safe event creation (recommended)
const event = makeEvent<CompanyCreatedEvent>({
  action: 'company.created',
  userId: 'user-123',
  workspaceId: 'workspace-123',
  payload: {
    companyId: 'company-123',
    companyName: 'Acme Inc.',
  },
});

// Alternative: less type-safe event creation
const unsafeEvent = makeUnsafeEvent({
  action: 'custom.action',
  userId: 'user-123',
  workspaceId: 'workspace-123',
  payload: {
    // Any custom data
    key1: 'value1',
    key2: 'value2',
  },
});

// Send the event to your analytics backend
// ...
```

## API Reference

### Functions

#### `makePageview(data: Record<string, unknown>): Pageview`

Creates a pageview event with validation through the pageview schema.

#### `makeEvent<T extends SpecificEventType>(data: Omit<T, CommonPropertiesType>): T`

Creates a type-safe event with validation through the appropriate event schema.

#### `makeUnsafeEvent(data: Record<string, unknown>): Event`

Creates an event with less type safety, but still validates through the base event schema.

### Types

#### `Pageview`

Represents a page view event with the following properties:
- `href`: The full URL of the page
- `locale`: The user's locale
- `pathname`: The path portion of the URL
- `referrer`: The referring URL
- `sessionId`: An identifier for the user's session
- `timeZone`: The user's timezone
- `timestamp`: A datetime string (added automatically)
- `userAgent`: The user's browser/device information
- `userId`: An optional string for the user who viewed the page
- `version`: A string for versioning (added automatically)
- `workspaceId`: An optional string for the workspace where the pageview occurred

#### `Event`

Base event type with the following properties:
- `action`: A string that identifies the type of event
- `timestamp`: A datetime string (added automatically)
- `version`: A string for versioning (added automatically)
- `userId`: An optional string for the user who triggered the event
- `workspaceId`: An optional string for the workspace where the event occurred
- `payload`: A record that can contain any data specific to the event

#### `SpecificEventType`

A union type of all specific event types, such as:
- `ApiKeyCreatedEvent`
- `CompanyCreatedEvent`
- `PersonCreatedEvent`
- And many more

## Integration with Twenty Server

Twenty Analytics is designed to work seamlessly with the Twenty server. The server provides an `AnalyticsService` that uses this package to create and send analytics events to ClickHouse.

```typescript
// Example of server-side integration
import { Injectable } from '@nestjs/common';
import { AnalyticsService } from 'src/engine/core-modules/analytics/services/analytics.service';

@Injectable()
export class YourService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async yourMethod(userId: string, workspaceId: string) {
    // Create an analytics context
    const analyticsContext = this.analyticsService.createAnalyticsContext(
      userId,
      workspaceId,
    );

    // Send an event
    await analyticsContext.sendEvent({
      action: 'your.action',
      payload: {
        // Your event data
      },
    });

    // Send a pageview
    await analyticsContext.sendPageview({
      href: 'https://example.com/page',
      locale: 'en-US',
      pathname: '/page',
      referrer: '',
      sessionId: 'session-123',
      timeZone: 'UTC',
      userAgent: 'User Agent String',
    });
  }
}
```

## Data Storage

By default, Twenty Analytics is configured to work with ClickHouse for data storage. Events are stored in the `events` table, and pageviews are stored in the `pageview` table.

## License

This package is part of the Twenty project and is licensed under the same terms.