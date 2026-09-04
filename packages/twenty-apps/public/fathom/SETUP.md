# Setup

Follow these steps to get your app running locally.

## Prerequisites

- Node.js (version specified in `.nvmrc`)
- Yarn 4
- Docker (to run the local Twenty server)
- A Fathom OAuth client
- A public HTTPS URL forwarding to the local Twenty server

Register this OAuth callback in Fathom:

```text
https://<development-host>/auth/apps/callback
```

Set Twenty's `SERVER_URL` to that same public host. The connection hook registers
this destination with Fathom automatically:

```text
https://<development-host>/webhooks/server/72b52885-e1ba-419f-8e2e-052700f2c9f2?connectionId=<connected-account-id>
```

The ID is the **Fathom webhook resolver** logic function. Deliveries are routed
to the workspace that made the connection, so no per-workspace domain is needed.

## Steps

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Start the local Twenty server:

   ```bash
   yarn twenty docker:start
   ```

   Check the server status at any time with `yarn twenty docker:status`.

3. Set `FATHOM_CLIENT_ID` and `FATHOM_CLIENT_SECRET` as server variables in
   Twenty.

4. Start the development server and sync your app:

   ```bash
   yarn twenty dev
   ```

5. Open [http://localhost:2020](http://localhost:2020), log in with the default development credentials: `tim@apple.dev` / `tim@apple.dev`, and connect Fathom from Settings. The connection hook registers the signed webhook.

## Verifying your setup

- `yarn lint` - Lint the project with oxlint
- `yarn typecheck` - Type-check the project
- `yarn test:unit` - Run unit tests
- `yarn test` - Run integration tests

## Troubleshooting

See the [troubleshooting guide](https://docs.twenty.com/developers/extend/apps/getting-started/troubleshooting) or ask on [Discord](https://discord.gg/cx5n4Jzs57).
