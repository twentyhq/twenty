# Salesforce Migration — Setup guide

This guide is for the server admin who connects the app to Salesforce. The app
authenticates server-to-server with the OAuth 2.0 **Client Credentials** flow:
no per-user login, no token pasting, tokens are refreshed automatically.

## 1. Create a Connected App in Salesforce

1. In Salesforce **Setup**, search for **App Manager** and click **New Connected App**
2. Fill in the basic information (name, contact email)
3. Check **Enable OAuth Settings**
   - Callback URL: `https://login.salesforce.com/services/oauth2/callback` (unused by this flow, but required by the form)
   - Selected OAuth scopes: **Manage user data via APIs (api)**
4. Check **Enable Client Credentials Flow**
5. Save, then open the app's **Manage** page → **Edit Policies**
   - Under *Client Credentials Flow*, set **Run As** to an integration user
     that has **read access** to Accounts, Contacts, Leads, Opportunities,
     Tasks, and Notes
6. From **Manage Consumer Details**, copy the **Consumer Key** and
   **Consumer Secret**

> Salesforce can take a few minutes to activate a new Connected App.

## 2. Configure the app in Twenty

In Twenty, go to **Settings → Applications → Salesforce Migration** and set:

| Variable | Value |
| --- | --- |
| `SALESFORCE_INSTANCE_URL` | Your My Domain URL, e.g. `https://mycompany.my.salesforce.com` (sandboxes: `https://mycompany--sandbox.sandbox.my.salesforce.com`) |
| `SALESFORCE_CLIENT_ID` | The Connected App Consumer Key |
| `SALESFORCE_CLIENT_SECRET` | The Connected App Consumer Secret |
| `SALESFORCE_API_VERSION` | Optional, defaults to `62.0` |

Optional tuning in the application variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `MIGRATION_BATCH_SIZE` | `200` | Records fetched and written per batch |
| `MIGRATION_ERROR_RECORD_LIMIT` | `500` | Max stored per-record error entries per migration |

## 3. Run a migration

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
- **Error isolation**: a failing record never stops the run. It is counted,
  stored in `Salesforce Migration Errors` with the original payload, and the
  batch continues. Transient Salesforce errors (429/5xx) are retried with
  backoff; five consecutive batch failures mark the object as failed and the
  migration moves on.
- **Safe concurrency**: a heartbeat prevents two workers from processing the
  same migration at once.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `Salesforce authentication failed (400): invalid client credentials` | Wrong Consumer Key/Secret, or the Client Credentials flow is not enabled |
| `... no access token ...` | The Connected App has no run-as user configured |
| Connection works but counts fail for an object | The run-as user lacks read permission on that object; the plan lists it as a warning |
| Migration stuck in `Running` with no progress | Check the migration's `Last error` field and the `Salesforce Migration Items` view for the failing object |
