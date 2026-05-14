# App Structure And CLI

Use this reference when creating or modifying files inside an existing Twenty app.

## App Checks

Before changing app entities, confirm the current directory is a Twenty app:

```bash
test -f package.json
test -f src/application-config.ts
```

Inspect the app shape:

```bash
sed -n '1,220p' package.json
sed -n '1,220p' src/application-config.ts
find src -maxdepth 3 -type f | sort
find public -maxdepth 2 -type f | sort
```

## CLI

Prefer the app CLI for new entities:

```bash
yarn twenty add
```

Run the app after changes:

```bash
yarn twenty dev
```

Use official Twenty docs or local SDK source when exact imports, entity fields, or configuration shapes matter.

## Boundaries

- Do not scaffold a new app from this workflow. Use Create App first when the app does not exist.
- Do not guess generated entity shapes when the CLI or docs can provide them.
- Keep app changes scoped to the requested feature and its required registrations.
