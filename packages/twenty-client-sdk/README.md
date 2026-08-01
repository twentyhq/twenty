# twenty-client-sdk

Typed API clients for [Twenty](https://twenty.com), generated from your instance's GraphQL schema.

## Entry points

- `twenty-client-sdk/core` — typed client for the core API. Ships as a stub; it is replaced by a client generated from the workspace schema when an app is installed or synced (`yarn twenty dev`), or regenerated on demand with `yarn twenty dev:generate-client`.
- `twenty-client-sdk/metadata` — typed client for the metadata API.
- `twenty-client-sdk/rest` — thin REST client.
- `twenty-client-sdk/generate` — the code generation entry used by `twenty-sdk` and the Twenty server.

## Generating the client

Inside an app, `yarn twenty dev` keeps the client in sync automatically. Outside of that flow:

```bash
# Replace the client inside node_modules (default)
yarn twenty dev:generate-client

# Emit committable TypeScript source to a repo path
yarn twenty dev:generate-client --output src/generated/twenty

# Emit only the schema types (single schema.ts, no runtime client)
yarn twenty dev:generate-client --output src/generated/twenty --types-only
```

See the [CLI documentation](https://twenty.com/developers/extend/apps/operations/cli) for the full workflow.

## Credits

Code generation and the client runtime are built on [genql](https://github.com/remorses/genql) (MIT, © Tommaso De Rossi "morse"), vendored into this package — see `src/generate/genql/README.md` for what was kept and changed versus upstream.
