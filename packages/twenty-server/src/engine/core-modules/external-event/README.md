# External Event Module

The External Event module provides an HTTP API endpoint for writing events to the ExternalEvent ClickHouse table. It also includes a configurable validation system for events similar to Segment Protocols.

## Overview

This module allows clients to send event data to Twenty's ClickHouse database. Events are stored with their workspace context and can be used for analytics, monitoring, and integration purposes.

## Key Features

- **Event Collection API**: Simple HTTP endpoint for sending events
- **Workspace-specific Validation**: Define validation rules per workspace
- **Schema Validation**: Validate events against defined metadata
- **GraphQL Management API**: Create and manage event metadata

## Authentication

Authentication is based on secure token verification.

### External Event Token Authentication

To use the External Event API, you need to create a token via the GraphQL API. This token is securely stored in the database and can be revoked if needed.

To create a token:

```graphql
mutation {
  createExternalEventToken {
    token
    expiresAt
  }
}
```

Security features:
- Tokens are cryptographically secure random values (32 bytes)
- Only hashed tokens are stored in the database, never plain values
- Tokens are linked to both user and workspace for tracking and access control
- Tokens can be revoked if compromised
- Token values are only returned once when created and cannot be retrieved later
- Default expiration of 1 year

## Event Structure

Events follow the ClickHouse table structure:

```typescript
interface ExternalEventInput {
  // The event name/type (maps to 'event' column)
  event: string;
  
  // ID of the object related to this event
  objectId: string;
  
  // Type of the object related to this event (e.g., 'company', 'person', 'opportunity')
  objectType?: string;
  
  // User ID related to this event (optional)
  userId?: string;
  
  // Additional event properties (as JSON)
  properties: Record<string, any>;
}
```

## Validation Architecture

The External Event module implements a two-level validation system:

### 1. Platform-level Validation

All events, regardless of workspace, must pass basic structural validation:
- `event` must be a non-empty string
- `objectId` must be a non-empty string
- `properties` must be a valid object

This validation is enforced by the `BaseEventValidationRule` in the validator.

### 2. Workspace-specific Validation

Each workspace can define validation rules for different event types via event metadata.

#### Event Metadata Structure

```
EventMetadata
├── eventName
├── description
├── workspaceId
├── strictValidation    # Controls whether unknown properties are allowed
├── validObjectTypes[]  # Optional list of allowed object types
└── EventFieldMetadata[]
    ├── name
    ├── fieldType (string, number, boolean, object)
    ├── isRequired
    └── allowedValues[]
```

When `strictValidation` is set to `false` (default), unknown properties will be accepted silently. When set to `true`, unknown properties will cause validation errors.

## Managing Event Metadata

You can create and manage event metadata using the GraphQL API:

### Create Event Metadata

```graphql
mutation {
  createEventMetadata(input: {
    eventName: "page.viewed",
    description: "Triggered when a user views a page",
    validObjectTypes: ["page"],
    strictValidation: false
  }) {
    id
    eventName
    strictValidation
  }
}
```

### Add an Event Field

```graphql
mutation {
  addEventField(
    eventMetadataId: "event-metadata-id",
    input: {
      name: "pageName",
      fieldType: "string",
      isRequired: true,
      description: "The name of the page that was viewed"
    }
  ) {
    id
    name
    fieldType
  }
}
```

### Get Event Metadata

```graphql
query {
  eventMetadataList {
    id
    eventName
    strictValidation
    fields {
      name
      fieldType
      isRequired
    }
  }
}
```

## API Endpoints

### Create External Event

**Endpoint:** `POST /api/external-event/:workspaceId`

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "event": "page.viewed",
  "objectId": "page-123",
  "objectType": "page",
  "userId": "user-456",
  "properties": {
    "pageName": "Home",
    "url": "https://example.com",
    "referrer": "https://google.com"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

## Usage Example

```typescript
// First, create a token through the GraphQL API and store it securely
const token = "your-secure-token-from-graphql-mutation";

// Send external event using the token
fetch(`https://api.twenty.com/api/external-event/${workspaceId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    event: "user.identified",
    objectId: "user-123",
    objectType: "user",
    properties: {
      email: "user@example.com",
      name: "Example User",
      plan: "premium"
    }
  })
});
```

## ClickHouse Integration

Events are stored in the `externalEvent` table in ClickHouse with the following schema:
- `event`: The name of the event (String)
- `timestamp`: When the event occurred (DateTime64)
- `userId`: The ID of the user who triggered the event (String)
- `workspaceId`: The ID of the workspace (String)
- `objectId`: The ID of the object related to this event (String)
- `objectType`: The type of object related to this event (String)
- `properties`: Additional event properties (JSON) 