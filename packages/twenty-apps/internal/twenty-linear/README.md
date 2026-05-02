# twenty-linear

End-to-end test app for Twenty's generic OAuth provider infrastructure.
Connects a workspace member's Linear account and exposes two **tools** —
discoverable from workflow nodes and the AI chat:

- `list-linear-teams` — returns the connected user's Linear teams (handy
  for finding a `teamId`). Takes no input.
- `create-linear-issue` — creates a new Linear issue. Inputs: `teamId`,
  `title`, optional `description`.

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
3. As the server admin, paste **Client ID** and **Client Secret** into the
   `LINEAR_CLIENT_ID` / `LINEAR_CLIENT_SECRET` server variables on the
   application registration (one OAuth app per Twenty server).
4. In the Linear app's settings tab → **Connections**, click **Add
   connection**, pick a scope (Just for me / Workspace shared), then
   complete the Linear consent screen. You'll be redirected back with the
   credential saved.

## Use the tools

- **From a workflow:** add a `LOGIC_FUNCTION` step, pick `create-linear-issue`,
  and fill in `teamId` + `title` (and optional `description`).
- **From the AI chat:** ask "create a Linear issue in team <X> titled <Y>"
  — the AI discovers the tool and calls it with the right input.

## What this exercises

- `defineOAuthProvider` registration → `applicationOAuthProvider` row in
  the core schema.
- Authorize endpoint → Linear consent screen → callback endpoint → token
  exchange via `SecureHttpClientService.createSsrfSafeFetch()` → new
  `connectedAccount` row with `provider = 'app'`.
- `listConnections({ providerName: 'linear' })` in the handler →
  `POST /apps/connections/list` → server refreshes the access token if
  expired and returns the connection.
- The `find(c => c.scope === 'workspace') ?? connections[0]` selection
  pattern shows how a tool handler picks a credential without a request
  user context.
