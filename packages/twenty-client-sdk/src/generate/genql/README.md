# Vendored genql codegen

This folder is a narrowed, vendored copy of [`@genql/cli`](https://github.com/remorses/genql)
`3.0.5` (upstream commit `4a547db46a9a614cc2b5958e28674af351898464`; MIT,
© Tommaso De Rossi "morse"), used to generate the typed GraphQL client from an
SDL string.

Per-file provenance lives in `provenance.json`: every file's `origin` names
who authored its current content — `genql` (upstream code kept near-verbatim:
`render/`, `runtime/`, `LICENSE`; frozen by a content hash) or `twenty`
(written by Twenty: the orchestration rewritten when vendoring, and this
README). `../__tests__/genql-provenance.test.ts` enforces the ledger, so a
`genql` file cannot change without a deliberate ledger update in the same
commit. Upstream's own test suite (integration + unit) is ported under
`../__tests__/upstream-3.0.5/` and pins the engine's behavior and generated
types; the snapshot test below pins its bytes.

It was vendored to remove `@genql/cli` from the dependency graph, which pulled
in abandoned and vulnerable transitive packages (`undici`, `native-fetch`,
`listr`, etc.) that Twenty never executed.

## What was kept

- `render/` — the schema → TypeScript client renderers (copied verbatim).
- `runtime/` — the genql client runtime, copied verbatim into every generated
  client's `runtime/` folder (see `../runtime-templates.ts`).
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
- **Runtime files are imported as `?raw` text** (`../runtime-templates.ts`) instead
  of read from `node_modules` at generation time, so they ship with this bundle.
- **`Config` was narrowed** to the schema-string inputs Twenty actually passes
  (`schema`, `output`, `scalarTypes`, `sortProperties`). The introspection
  (`endpoint`/`useGet`/`headers`), custom-`fetch` (`fetchImport`) and listr
  (`verbose`) options were removed. The renderers are otherwise verbatim, so the
  generated client still defaults its url/fetch to `undefined` (Twenty's wrapper
  supplies them) and the output is unchanged.

Twenty-specific typing tweaks live OUTSIDE this tree so the vendored engine
stays verbatim: composite RAW_JSON sub-fields (e.g. `Emails.additionalEmails`)
get their real TypeScript shape via a post-processing pass over the generated
`schema.ts` (`../composite-field-type-overrides.ts`), never via renderer edits.
The engine's own output is pinned byte-for-byte by the snapshot test in
`../__tests__/genql-engine-output.test.ts`.

The renderers are vendored verbatim from `@genql/cli@3.0.5`. Formatting now runs
on `prettier@^3` (the version the monorepo resolves): it needs the explicit
`prettier/plugins/estree` printer and an awaited, async `format()`. The runtime
query path is covered by `__tests__/generated-client-query.test.ts`, which drives
a real generated client against a mock transport.

## License

MIT — see `LICENSE`.
