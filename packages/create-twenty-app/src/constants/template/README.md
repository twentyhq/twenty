This is a [Twenty](https://twenty.com) application bootstrapped with [`create-twenty-app`](https://www.npmjs.com/package/create-twenty-app).

## Getting Started

This app was scaffolded with a local Twenty server running at [http://localhost:2020](http://localhost:2020).

Login with the default development credentials: `tim@apple.dev` / `tim@apple.dev`.

Run `yarn twenty help` to list all available commands.

## Useful Commands

- `yarn twenty dev` - Start the development server and sync your app
- `yarn twenty docker:status` - Check the local Twenty server status
- `yarn twenty docker:start` - Start the local Twenty server
- `yarn lint` - Lint the project with oxlint
- `yarn typecheck` - Type-check the project
- `yarn test:unit` - Run unit tests
- `yarn test` - Run integration tests

## Continuous Integration & Deployment

This app ships with two self-contained GitHub Actions workflows:

- **CI** (`.github/workflows/ci.yml`) - on every push and pull request, spins up a
  disposable Twenty test instance, then runs lint, typecheck, unit and integration
  tests. No setup required.
- **CD** (`.github/workflows/cd.yml`) - on every push to `main` (or manually via
  "Run workflow"), publishes the app privately to a dedicated Twenty workspace and
  installs it there.

To enable deployments, add these repository secrets
(Settings → Secrets and variables → Actions):

- `TWENTY_API_URL` - base URL of your dedicated Twenty workspace
- `TWENTY_API_KEY` - an API key for that workspace

You can also publish from your machine with `yarn twenty app:publish --private`.

## Learn More

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start)
- [twenty-sdk CLI reference](https://www.npmjs.com/package/twenty-sdk)
- [Discord](https://discord.gg/cx5n4Jzs57)
