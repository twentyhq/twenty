# Setup

Use Node.js from `.nvmrc` and Yarn 4. Install the standalone CLI globally:

```bash
npm install -g twenty
yarn install
```

Connect to your existing Twenty workspace, or start a server using the [local-server guide](https://docs.twenty.com/developers/extend/apps/getting-started/local-server):

```bash
twenty auth login --url https://your-workspace.twenty.com --name dev
twenty app apply --create
twenty app dev
```

The first apply registers and installs your app. Dev watches and syncs later source changes. `twenty app init` does not authenticate, start containers, or install the app.

## Validation

- `yarn lint`, lint the project.
- `yarn typecheck`, check source and test types.
- `yarn test:unit`, run unit tests.
- `yarn test`, run integration tests against a disposable workspace configured with `TWENTY_API_URL` and `TWENTY_API_KEY`.

Integration tests install and uninstall the app. Install the CLI globally or set `TWENTY_CLI` to a local executable path.
