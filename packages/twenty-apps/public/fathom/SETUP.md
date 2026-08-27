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

Configure Twenty's `TWENTY_FUNCTIONS_URL` with the public functions base URL,
including its path when present, for example `https://<development-host>/s`.
The connection hook registers this destination automatically:

```text
https://<development-host>/s/webhook/fathom?connectionId=<connected-account-id>
```

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
