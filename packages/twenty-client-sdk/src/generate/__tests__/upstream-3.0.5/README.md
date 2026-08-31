# Ported genql 3.0.5 test suite

Port of the test suite of [`remorses/genql`](https://github.com/remorses/genql)
at `@genql/cli@3.0.5` (commit `4a547db46a9a614cc2b5958e28674af351898464`), the
version the codegen in `../../genql` was vendored from. It protects the
vendored engine's behavior; the engine's output bytes are pinned by
`../genql-engine-output.test.ts` and by the checked-in `fixture/generated/`
client (`generated-fixture-drift.test.ts`).

| Here | Upstream |
| --- | --- |
| `fixture/schema.graphql` | `integration-tests/schema.graphql` (byte-verbatim) |
| `fixture/generated/` | output of the vendored engine for that schema, checked in so type-level assertions compile; pinned by `generated-fixture-drift.test.ts` |
| `generate-queries.test.ts` | `integration-tests/tests/simple.ts` |
| `execute-queries.test.ts` | `integration-tests/tests/execution.ts` |
| `type-selection.test.ts` | `cli/src/typeSelection.test.ts` |
| `type-map.test.ts` | `cli/src/render/typeMap/index.test.ts` |
| `render-typing.test.ts` | `cli/src/render/common/__tests__/renderTyping.test.ts` |
| `comment.test.ts` | `cli/src/render/common/__tests__/comment.test.ts` |
| `render-context.test.ts` | `cli/src/render/common/__tests__/RenderContext.test.ts` |
| `render-schema.test.ts` | `cli/src/render/schema/renderSchema.test.ts` |
| `render-test-helpers.ts` | `cli/src/testHelpers/render.ts` |

Not ported: `parse.test.ts` and `printer.test.ts` (they cover CLI/printer code
Twenty did not vendor) and the subscription suite (already skipped upstream).

## Adaptations

Selections, resolvers, assertions and test names are upstream's. What changed:

- **mocha/sucrase/snap-shot-it → vitest.** Snapshots are vitest snapshots.
- **apollo-server (v3, deprecated) → graphql-js execution.** `execution.ts`
  booted a real HTTP server per test; `execute-queries.test.ts` runs the same
  resolvers through `graphql()` behind an injected `fetch`/`fetcher`, which
  exercises the identical client code path with no network and no new
  dependency.
- **tsd `expectType` → vitest `expectTypeOf`, now actually checked.** Upstream
  ran its integration tests through sucrase, which strips types without
  checking them, so its type assertions were never verified — and several were
  wrong. The assertions here pin what the 3.0.5 engine actually generates
  (fields absent from a response are `undefined`, never `null`; `__typename`
  is a literal type) and are enforced by the package typecheck.
- **`type-map.test.ts` assertions enabled.** Upstream ran them in
  output-logging mode with stale expected values; the values here match the
  engine's actual output.
