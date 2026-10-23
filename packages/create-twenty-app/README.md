# create-twenty-app is retired

Install the standalone Twenty CLI and create your app:

```sh
npm install -g twenty
twenty app init my-app
cd my-app
yarn install
twenty auth login --url https://your-workspace.twenty.com
twenty app dev --create
```

For existing apps, keep `twenty-sdk` as an application dependency. Install `twenty` globally and replace `yarn twenty ...` scripts with the corresponding `twenty app ...` commands.

This package only prints migration instructions and exits with code 1. It no longer creates files, installs dependencies, starts servers, or authenticates.

See the [CLI reference](https://docs.twenty.com/developers/extend/apps/operations/cli).
