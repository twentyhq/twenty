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
4. Click **Connect Linear** in the OAuth Connections section. You'll be
   redirected to Linear, asked to authorize, and bounced back to Twenty
   with the connection saved.

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
  exchange via `SecureHttpClientService.createSsrfSafeFetch()` → upserted
  `connectedAccount` row with `provider = 'app'`.
- `useOAuth('linear')` in the handler reads the access token injected
  into `process.env` (`OAUTH_LINEAR_ACCESS_TOKEN`).
- The token-refresh driver kicks in once the original access token
  expires (Linear access tokens last 10 years by default, so the refresh
  path is harder to verify casually — set `accessTokenExpiresInMs` to
  something like `60_000` on the OAuth provider config to force it).
