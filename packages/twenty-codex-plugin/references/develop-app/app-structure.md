# App Structure

Use this reference when creating or modifying files inside an existing Twenty app.

Use `../manage-app/cli-and-sync.md` for CLI command behavior, remotes, authentication, sync troubleshooting, build, deploy, logs, and CI/CD.

## App Checks

Before changing app entities, confirm the current directory is a Twenty app:

```bash
test -f package.json
test -f src/application-config.ts
```

If this fails, do not edit from the wrong folder. Check the current path and nearby app roots:

```bash
pwd
find . -maxdepth 3 -name package.json -o -path '*/src/application-config.ts'
```

Move to the matching app root before continuing. If no app exists, use `create-app`. If the folder exists but tooling, dependencies, remotes, authentication, sync, or builds are broken, use `manage-app` before changing app entities.

Inspect the app shape:

```bash
sed -n '1,220p' package.json
sed -n '1,220p' src/application-config.ts
find src -maxdepth 3 -type f | sort
find public -maxdepth 2 -type f | sort
```

## Entity Creation

Prefer the app CLI for new entities when interactive prompts are acceptable:

```bash
yarn twenty dev:add
```

For non-interactive agent work, direct file creation is often better. Use generated CLI templates, local SDK typings, or existing app files as the source of truth for imports and config shape.

Use official Twenty docs or local SDK source when exact imports, entity fields, or configuration shapes matter.

## Boundaries

- Do not scaffold a new app from this workflow. Use `create-app` first when the app does not exist.
- Do not guess generated entity shapes when the CLI or docs can provide them.
- Keep app changes scoped to the requested feature and its required registrations.

## Validation Checklist

After entity changes, run these before handing off when practical:

```bash
yarn twenty dev:typecheck
yarn lint
yarn twenty dev --once
```

If any command fails because of setup, dependencies, remotes, authentication, sync, builds, logs, or CI/CD, switch to `manage-app` and use `../manage-app/cli-and-sync.md`.

`yarn test` usually runs integration tests and may expect a local Twenty server at `http://localhost:2020` unless the app config or environment points elsewhere. Treat a missing local server as an environment/setup issue, not as proof that entity definitions are wrong.
