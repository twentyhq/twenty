# Set up Granola

1. In a Granola Business or Enterprise workspace, create an API key from **Settings → Connectors → API keys**. Workspace keys sync notes shared with the whole workspace; personal keys also sync the owner's own notes.
2. Install Granola in Twenty, then open **Settings → Applications → Granola → Settings**. You need application-management permission.
3. Paste the key and choose **Connect**. The key is saved as a secret application variable. The app checks it, detects the key type, registers a signed webhook, and queues the last 31 days of notes. The **Connecting** button keeps its loader and label visible until setup finishes, then the API key card shows **Connected**.
4. If connection setup fails, an error appears below the key field. Choose **Connect** to retry, or **Cancel** to remove the saved key and start again. Choosing **Connect** also repairs a missing or paused Granola endpoint. The app never re-enables a paused endpoint on its own; the daily catch-up only imports notes updated in the last two days.
5. To restrict sync, turn off **Sync all folders** and pick up to 100 folders. A picked folder includes its subfolders, and changes save automatically. Existing records outside a new filter are retained.
6. Use **Import history** for a larger window, from 1 to 3650 days. Notes appear gradually in Call Recordings. Repeating an import updates the same records.
7. To rotate the key, use the red trash button beside **Connected**, then enter the new key and choose **Connect**. The trash button is labelled **Remove API key** for screen readers. Setup registers the connection with the new key.

## Local development

```sh
yarn install --immutable
yarn lint
yarn typecheck
yarn test:unit
yarn twenty dev:build
```

For installation tests, start an isolated Twenty test instance with `yarn twenty docker:start --test`, then run `TWENTY_API_URL=http://localhost:2021 yarn test`. The integration configuration defaults to the scaffold's local dev instance at port 2020; the `--test` instance listens on 2021, hence the override above. Override `TWENTY_API_URL` and `TWENTY_API_KEY` only with credentials for an isolated test workspace: setup installs and teardown uninstalls this app.

The deployed function-execution tests need an authenticated QA user’s access token in `TWENTY_API_KEY`. The scaffold’s default API key can install the app and inspect its schema, but cannot authorize user-only function execution.

For real webhook QA, expose your Twenty server through a public HTTPS tunnel and configure its advertised server URL accordingly. Registration derives the delivery URL from the runtime's `TWENTY_API_URL`; the app rejects HTTP URLs. Granola requires the resulting HTTPS endpoint to be publicly reachable. A browser-only tunnel does not expose the webhook server.

## API import

Use a Twenty bearer token belonging to a user with application-management permission:

```sh
curl --request POST "$TWENTY_API_URL/s/granola/backfill" \
  --header "Authorization: Bearer $TWENTY_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"days":365}'
```

## Verify before release

- Connect a real workspace key, then a personal key, and verify the detected scopes and readable failures for invalid keys or unavailable plans.
- Generate a meeting, edit its summary, and confirm one Call Recording is updated with transcript and shared summary. Confirm private notes never appear.
- Deliver the same signed event twice; confirm the deterministic recording ID is unchanged. Check unsigned and expired deliveries are rejected, including after a queue delay.
- Pick a parent folder, confirm a descendant note syncs and an outside note does not, then turn **Sync all folders** back on.
- Run initial and manual history imports, including a deleted Twenty recording. Confirm it stays deleted.
- Disable the endpoint in Granola, exercise daily catch-up, and confirm updated notes are still imported while the endpoint stays paused. Confirm **Connect** re-enables it.
- Rotate the key and uninstall. Verify endpoint cleanup, or remove endpoints the replacement key cannot access.

## Provider references

- [Granola OpenAPI](https://docs.granola.ai/api-reference/openapi.json)
- [Granola webhooks](https://docs.granola.ai/webhooks)
- [Granola API keys](https://docs.granola.ai/help-center/sharing/integrations/granola-api)
- [Twenty publishing](https://docs.twenty.com/developers/extend/apps/operations/publishing)
