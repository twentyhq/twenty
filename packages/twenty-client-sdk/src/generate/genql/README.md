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
- **Replaced `@graphql-tools/load`** with graphql's own `buildSchema` — Twenty
  passes an SDL string, so the extra loader (and its dependency) is unnecessary.
  Verified to produce byte-identical output.
- **Runtime files are imported as `?raw` text** (`runtime-templates.ts`) instead
  of read from `node_modules` at generation time, so they ship with this bundle.
- **`Config` was narrowed** to the schema-string inputs Twenty actually passes
  (`schema`, `output`, `scalarTypes`, `sortProperties`). The introspection
  (`endpoint`/`useGet`/`headers`), custom-`fetch` (`fetchImport`) and listr
  (`verbose`) options were removed. The renderers are otherwise verbatim, so the
  generated client still defaults its url/fetch to `undefined` (Twenty's wrapper
  supplies them) and the output is unchanged.

The renderers are vendored verbatim from `@genql/cli@3.0.5`. Formatting now runs
on `prettier@^3` (the version the monorepo resolves): it needs the explicit
`prettier/plugins/estree` printer and an awaited, async `format()`. The runtime
query path is covered by `__tests__/generated-client-query.test.ts`, which drives
a real generated client against a mock transport.

## License

MIT — see `LICENSE`.
