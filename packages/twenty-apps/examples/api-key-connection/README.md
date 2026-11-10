# API key connection

Example Twenty app where each user connects their own Acme account by pasting
an API key, using a connection provider with `type: 'apiKey'`.

- `src/connection-providers/acme.connection-provider.ts` declares the provider.
  Twenty shows a "Connect with Acme" card in the app's settings; clicking it
  opens a dialog for the key, which is stored encrypted as a connected account.
- `src/logic-functions/identify-acme-account.ts` runs before the key is saved.
  It calls Acme with the key and returns the account id and handle; throwing
  rejects the key and nothing is stored.
- `src/logic-functions/get-acme-profile.ts` reads the requesting user's key
  with `listConnections` + `findConnectionForRequest` and calls Acme with it.
  On a 401 it calls `reportConnectionAuthFailure`, so the user sees
  "Reconnect" in settings and can paste a new key.

Acme is a stand-in: `https://httpbin.org/bearer` accepts any bearer token.
Point `ACME_WHOAMI_URL` at your vendor's "who am I" endpoint.

## API key connection or server variable?

| Use | When |
| --- | --- |
| `apiKey` connection provider | Each user (`scope: 'USER'`) or the workspace (`scope: 'WORKSPACE'`) brings its own key, and you want connect, reconnect and disconnect in the UI. |
| `serverVariables` / `applicationVariables` on `defineApplication` | One key, set by an admin, shared by every workspace or install. |

## Run it

```sh
yarn install
yarn twenty app apply
```

Requires Twenty and `twenty-sdk` 2.58.0 or later.
