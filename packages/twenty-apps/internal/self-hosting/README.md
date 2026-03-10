# Self Hosting

Used to manage billing and telemetry of self-hosted instances

## Features

### Telemetry Webhook

Receives user signup telemetry events from self-hosted Twenty instances and creates/updates selfHostingUser records.

**Endpoint:** `POST /webhook/telemetry`

**Payload Structure:**
```json
{
  "action": "user_signup",
  "timestamp": "2025-11-21T...",
  "version": "1",
  "payload": {
    "userId": "uuid",
    "workspaceId": "uuid",
    "payload": {
      "events": [
        {
          "userEmail": "user@example.com",
          "userId": "uuid",
          "userFirstName": "John",
          "userLastName": "Doe",
          "locale": "en",
          "serverUrl": "https://self-hosted.example.com"
        }
      ]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Self hosting user created/updated: uuid"
}
```
