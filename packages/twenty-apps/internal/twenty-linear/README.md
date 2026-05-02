# twenty-linear

End-to-end test app for Twenty's generic OAuth provider infrastructure.
Connects a workspace member's Linear account and exposes two HTTP-route
logic functions:

- `GET /linear/teams` — list the connected user's Linear teams (handy for
  finding a `teamId`).
- `POST /linear/create-issue` — create a new Linear issue. Body:
  `{ "teamId": "...", "title": "...", "description": "..." }`.

## One-time setup at Linear

1. Visit https://linear.app/settings/api/applications/new and create a new
   OAuth application.
2. Set the **Redirect URI** to `<SERVER_URL>/apps/oauth/callback`, e.g.
   `http://localhost:3000/apps/oauth/callback` for local dev.
3. Copy the generated **Client ID** and **Client Secret**.

## Install in Twenty

1. Build & deploy the app: `cd packages/twenty-apps/internal/twenty-linear
   && yarn twenty deploy`.
2. Install it on your workspace from `Settings → Applications`.
3. Open the Linear app's settings tab and paste the **Client ID** and
   **Client Secret** into the matching application variables.
4. In the **Connections** section, click **Add connection** on the Linear
   row, pick a scope (Just for me / Workspace shared), then complete the
   Linear consent screen. You'll be redirected back with the credential
   saved.

## Verify

```bash
# 1. Find a teamId
curl -H "Authorization: Bearer <APP_ACCESS_TOKEN>" \
  '<SERVER_URL>/logic-functions/twenty-linear/linear/teams'

# 2. Create an issue
curl -X POST \
  -H "Authorization: Bearer <APP_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"teamId":"<TEAM_ID>","title":"Hello from Twenty"}' \
  '<SERVER_URL>/logic-functions/twenty-linear/linear/create-issue'
```

The response includes `issue.url` — open it to confirm the issue landed
in your Linear workspace.

## What this exercises

- `defineOAuthProvider` registration → `applicationOAuthProvider` row in
  the core schema.
- Authorize endpoint → Linear consent screen → callback endpoint → token
  exchange via `SecureHttpClientService.createSsrfSafeFetch()` → new
  `connectedAccount` row with `provider = 'app'`.
- `listConnections({ providerName: 'linear' })` in the handler →
  `POST /apps/connections/list` → server refreshes the access token if
  expired and returns the connection.
- The handler's `connections.find(c => c.userWorkspaceId === event.userWorkspaceId)`
  fallback-to-`scope === 'workspace'` pattern shows how a single handler
  serves both per-user and shared credentials.
