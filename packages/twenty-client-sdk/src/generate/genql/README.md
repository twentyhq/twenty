# Vendored genql codegen

This folder is a narrowed, vendored copy of [`@genql/cli`](https://github.com/remorses/genql)
`3.0.5` (MIT, © Tommaso De Rossi "morse"), used to generate the typed GraphQL
client from an SDL string.

It was vendored to remove `@genql/cli` from the dependency graph, which pulled
in abandoned and vulnerable transitive packages (`undici`, `native-fetch`,
`listr`, etc.) that Twenty never executed.

## What was kept

- `render/` — the schema → TypeScript client renderers (copied verbatim).
- `runtime/` — the genql client runtime, copied verbatim into every generated
  client's `runtime/` folder (see `runtime-templates.ts`).
- `tasks/`, `helpers/`, `main.ts` — narrowed orchestration.

## What was changed vs upstream

- **Dropped the live-endpoint introspection path** (`schema/fetchSchema.ts`),
  which was the only consumer of `undici` / `native-fetch` / `qs`. Twenty always
  passes a schema string, never an endpoint.
- **Dropped `listr`** — the generation tasks now run as plain sequential
  `async` functions. File contents are unchanged.
- **Replaced `fs-extra` / `mkdirp` / `rimraf`** with `node:fs`.
- **Runtime files are imported as `?raw` text** (`runtime-templates.ts`) instead
  of read from `node_modules` at generation time, so they ship with this bundle.

The generated output is byte-for-byte identical to what `@genql/cli@3.0.5`
produced (`prettier@^2.8` and `@graphql-tools/*` are retained for that reason).

## License

MIT — see `LICENSE`.
