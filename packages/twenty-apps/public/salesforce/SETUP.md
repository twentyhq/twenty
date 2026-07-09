# Salesforce Migration — Setup guide

Authentication uses Twenty's app connection framework: the server admin
registers one Salesforce **Connected App** per server, then each workspace
connects to its own Salesforce org with an OAuth click. Tokens are stored and
refreshed by Twenty; no API keys are ever pasted into a workspace.

## 1. Create a Connected App in Salesforce (server admin)

1. In Salesforce **Setup**, search for **App Manager** and click **New Connected App**
2. Fill in the basic information (name, contact email)
3. Check **Enable OAuth Settings**
   - Callback URL: `https://<your-twenty-server>/auth/apps/callback`
   - Selected OAuth scopes:
     - **Manage user data via APIs (api)**
     - **Perform requests at any time (refresh_token, offline_access)**
     - **Access unique identifiers (openid)**
   - Check **Require Proof Key for Code Exchange (PKCE)** if available
4. Save, then from **Manage Consumer Details**, copy the **Consumer Key** and
   **Consumer Secret**

> Salesforce can take a few minutes to activate a new Connected App.

## 2. Register the credentials in Twenty (server admin)

On the Salesforce Migration application registration, set the server
variables:

| Variable | Value |
| --- | --- |
| `SALESFORCE_CLIENT_ID` | The Connected App Consumer Key |
| `SALESFORCE_CLIENT_SECRET` | The Connected App Consumer Secret |

## 3. Connect Salesforce (workspace admin)

In Twenty, go to **Settings → Applications → Salesforce Migration →
Connections** and click **Connect** on the Salesforce provider. Log in with a
Salesforce user that has **read access** to Accounts, Contacts, Leads,
Opportunities, Tasks, and Notes.

Workspace-level settings (application variables, all optional):

| Variable | Default | Purpose |
| --- | --- | --- |
| `SALESFORCE_API_VERSION` | `62.0` | Salesforce REST API version |
| `MIGRATION_BATCH_SIZE` | `200` | Records fetched and written per batch |
| `MIGRATION_ERROR_RECORD_LIMIT` | `500` | Max stored per-record error entries per migration |

## 4. Run a migration

Open the command menu (Cmd/Ctrl+K) and run **Migrate from Salesforce**. The
wizard tests the connection, analyzes your org, shows the plan, and streams
progress once you start.

## How the migration behaves

- **Idempotent**: every record is upserted by its Salesforce Id (stored on the
  migrated record). Re-running a migration updates instead of duplicating.
- **Resumable**: each object keeps an Id watermark; pause/resume or a restart
  continues exactly where it stopped.
- **Ordered**: companies are migrated before the people and opportunities that
  reference them, so relations always resolve.
- **Event-driven**: starting a migration kicks a worker that processes a
  time-boxed slice and chains the next slice until the migration is done. A
  low-frequency watchdog restarts the chain if a slice is ever interrupted
  (server restart, crash, transient Salesforce outage).
- **Error isolation**: a failing record never stops the run. It is counted,
  stored in `Salesforce Migration Errors` with the original payload, and the
  batch continues. Transient Salesforce errors (429/5xx) are retried with
  backoff; five consecutive batch failures mark the object as failed and the
  migration moves on.
- **Safe concurrency**: a heartbeat prevents the watchdog from racing a
  healthy worker chain.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Connect button fails with a credentials error | `SALESFORCE_CLIENT_ID` / `SALESFORCE_CLIENT_SECRET` not set on the application registration, or the Connected App is not active yet |
| `No Salesforce connection found` in the wizard | The workspace has not connected Salesforce yet (Settings → Applications → Connections) |
| `Could not resolve the Salesforce instance` | The Connected App is missing the `openid` scope; add it and reconnect |
| Counts fail for an object during analysis | The connected user lacks read permission on that object; the plan lists it as a warning |
| Migration stuck in `Running` with no progress | Check the migration's `Last error` field and the `Salesforce Migration Items` view; the watchdog retries stalled runs every 5 minutes |
