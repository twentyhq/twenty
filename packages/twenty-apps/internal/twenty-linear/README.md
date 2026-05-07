# Linear for Twenty

Connect your Linear account to Twenty to create issues and look up teams
straight from your workflows or the AI chat.

## What you can do

Once installed and connected, two tools become available:

- **Create Linear issue** — from the AI chat, ask something like
  *"create a Linear issue in the Engineering team titled 'Fix login bug'"*
  and the AI will file it for you. From a workflow, add it as a step
  with `teamId` + `title` (and optional `description`).
- **List Linear teams** — discovers the teams in your Linear workspace,
  useful when you need to pick a `teamId` for the create-issue step.

## Installing

1. Open **Settings → Applications** in your Twenty workspace.
2. Find **Linear** in the available apps and click **Install**.
3. Open the app, go to the **Connections** tab, and click **Add connection**.
4. Choose **Just for me** (your personal Linear account) or
   **Workspace shared** (a team-managed Linear account anyone in this
   workspace can act through), then complete the Linear sign-in.

That's it — you can now use the tools above.

> If you see a "Linear OAuth is not yet set up by your server administrator"
> notice on the Connections tab, ask your Twenty admin to follow the
> **Self-hosting setup** below — they need to provide the OAuth credentials
> before connections can be added.

---

## Self-hosting setup

This section is for Twenty server admins. If you're on Twenty Cloud, skip
this — the OAuth credentials are already configured.

### 1. Register an OAuth app in Linear

1. Visit https://linear.app/settings/api/applications/new.
2. Set the **Redirect URI** to `<SERVER_URL>/apps/oauth/callback` (for
   local dev: `http://localhost:3000/apps/oauth/callback`).
3. Copy the generated **Client ID** and **Client Secret**.

### 2. Wire the credentials into Twenty

1. In **Settings → Applications**, find **Linear**, click into it, and go
   to the **Application registration** tab (admin-only).
2. Paste your Linear **Client ID** into `LINEAR_CLIENT_ID` and the
   **Client Secret** into `LINEAR_CLIENT_SECRET`.

Workspace users will now be able to add Linear connections from the
**Connections** tab as described above.

### 3. (Developers only) Building the app from source

If you're working on this app rather than installing the published version:

```bash
cd packages/twenty-apps/internal/twenty-linear

# For day-to-day development (publish + install + watch in one):
yarn twenty dev

# Manual publish flow (deploy registers the app, install activates it):
yarn twenty deploy
yarn twenty install
```

`twenty dev` is recommended for iteration — it publishes, installs, and
watches for changes in one command. Use `twenty deploy` + `twenty install`
when you want to control each step separately (e.g. deploying to a
production server without auto-installing).

This serves as the reference implementation for Twenty's
`defineConnectionProvider({ type: 'oauth' })` flow — useful as a template
when adding OAuth integrations for other providers.
