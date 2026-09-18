# Set up Granola

1. In a Granola Business or Enterprise workspace, create an API key from **Settings → Connectors → API keys**. One key serves the whole Twenty workspace; members cannot connect their own Granola accounts yet. A workspace key reaches workspace-visible notes and spaces with API access enabled. A personal key also reaches its owner's notes and notes shared with them.
2. Install Granola in Twenty, then open **Settings → Applications → Granola → Settings**. You need application-management permission.
3. Paste the key and click **Connect**. The key is saved as a secret application variable. The API key card shows **Connecting** while the app checks the key, detects its type, registers a signed webhook, and queues the last 31 days of notes, then **Connected**.
4. If setup does not finish, the card shows why. **Invalid key** offers **Use another key**, which removes the saved key. **Unreachable** and **Setup incomplete** offer **Retry**. If the key itself cannot be saved, an error appears under the key field.
5. To restrict sync, choose **Some folders** and pick up to 100 folders. A picked folder includes its subfolders, and every click saves. Existing records outside a new filter are retained.
6. Use **Import history** for a larger window, from 1 to 3650 days. Notes appear gradually in Call Recordings. Repeating an import updates the same records.
7. To change the key, open **Danger zone**, click **Disconnect** and confirm, then paste the new key and click **Connect**. Disconnect deletes the Granola webhook with the old key first. If Granola refuses, the app only logs it, so check Granola for a leftover endpoint.

## Paused sync

Granola drops events while an endpoint is paused, and the app never re-enables it on its own. The card then shows **Paused**; click **Resume** to re-enable the endpoint, or recreate it if it was deleted. The daily catch-up imports notes updated in the last two days even while paused, so run a larger **Import history** after a longer outage.

## Limits

- Transcripts are fetched in up to 1,000 pages within 800 seconds. Notes beyond either limit are skipped without saving a partial transcript.
- Notes without a transcript keep their summary and show no transcript in Twenty.
- A recording links to a calendar event only when Granola's calendar event, or its invitees and start time, match exactly one Twenty event.

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

Live sync must be set up first. Use a Twenty bearer token belonging to a user with application-management permission:

```sh
curl --request POST "$TWENTY_API_URL/s/granola/backfill" \
  --header "Authorization: Bearer $TWENTY_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"days":365}'
```

## Verify before release

- Connect a real workspace key, then a personal key, and verify the detected scopes and readable failures for invalid keys or unavailable plans.
- Generate a meeting, edit its summary, and confirm one Call Recording is updated with transcript and shared summary. Confirm private notes never appear.
- Deliver the same signed event twice; confirm the deterministic recording ID is unchanged. Check unsigned and expired deliveries are rejected, and that a fresh delivery still verifies after a queue delay.
- Pick a parent folder, confirm a descendant note syncs and an outside note does not, then switch back to **Everything**.
- Run initial and manual history imports, including a deleted Twenty recording. Confirm it stays deleted.
- Disable the endpoint in Granola, exercise daily catch-up, and confirm updated notes are still imported while the endpoint stays paused. Confirm **Resume** re-enables it.
- Rotate the key and uninstall. Verify endpoint cleanup, or remove endpoints the replacement key cannot access.

## Provider references

- [Granola OpenAPI](https://docs.granola.ai/api-reference/openapi.json)
- [Granola webhooks](https://docs.granola.ai/webhooks)
- [Granola API keys](https://docs.granola.ai/help-center/sharing/integrations/granola-api)
- [Twenty publishing](https://docs.twenty.com/developers/extend/apps/operations/publishing)
