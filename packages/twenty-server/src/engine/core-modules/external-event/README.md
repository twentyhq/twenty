# External Event Module

This module provides an HTTP API endpoint for writing events to the ExternalEvent ClickHouse table.

## Overview

The External Event module allows clients to send event data to Twenty's ClickHouse database. Events are stored with their workspace context and can be used for analytics, monitoring, and integration purposes.

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

## API Endpoints

### Create External Event

**Endpoint:** `POST /api/external-event/:workspaceId`

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "event_type",
  "payload": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

### Create External Event Token (GraphQL)

**GraphQL Mutation:**
```graphql
mutation {
  createExternalEventToken {
    token
    expiresAt
  }
}
```

**Response:**
```json
{
  "data": {
    "createExternalEventToken": {
      "token": "a4f68c37-1e9d-4f8b-b20e-123456789abc",
      "expiresAt": "2023-12-31T23:59:59.999Z"
    }
  }
}
```

**IMPORTANT**: The token is only returned once during creation and cannot be retrieved later. Store it securely.

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
    type: 'custom.event',
    payload: {
      sourceSystem: 'my-app',
      action: 'user.clicked',
      metadata: { page: 'dashboard' }
    }
  })
});
```

## ClickHouse Integration

Events are stored in the `externalEvent` table in ClickHouse with the following schema:
- `workspaceId`: The ID of the workspace
- `type`: The type of event
- `payload`: The event payload (JSON)
- `createdAt`: Timestamp when the event was created 