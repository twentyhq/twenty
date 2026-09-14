# Setup

Follow these steps to get your app running locally.

## Prerequisites

- Node.js (version specified in `.nvmrc`)
- Yarn 4
- Docker (to run the local Twenty server)

## Steps

1. Install dependencies:

   ```bash
   yarn install
   ```

   This project ships a `yarn.lock` pinning every dependency to an exact,
   integrity-checked version, so nothing is resolved from the registry on this
   first install.

   If you enforce a minimum release age and would rather your own policy chose
   the versions, delete `yarn.lock` first — but expect to wait. Deleting it
   resolves the whole tree from scratch, and the `twenty-sdk`, `twenty-client-sdk`
   and `twenty-ui` pins above are the exact versions released alongside this
   scaffolder, so until each is older than your configured gate the install stops
   with `YN0016: All versions satisfying "…" are quarantined`. Either wait for
   them to age past it, or waive the gate for just those three in `.yarnrc.yml`
   via `npmPreapprovedPackages`.

2. Start the local Twenty server:

   ```bash
   yarn twenty docker:start
   ```

   Check the server status at any time with `yarn twenty docker:status`.

3. Start the development server and sync your app:

   ```bash
   yarn twenty dev
   ```

4. Open [http://localhost:2020](http://localhost:2020) and log in with the default development credentials: `tim@apple.dev` / `tim@apple.dev`.

## Verifying your setup

- `yarn lint` - Lint the project with oxlint
- `yarn typecheck` - Type-check the project
- `yarn test:unit` - Run unit tests
- `yarn test` - Run integration tests

## Troubleshooting

See the [troubleshooting guide](https://docs.twenty.com/developers/extend/apps/getting-started/troubleshooting) or ask on [Discord](https://discord.gg/cx5n4Jzs57).
