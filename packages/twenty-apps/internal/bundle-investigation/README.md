# bundle-investigation

Reproduces and analyses the `.mjs` bundles that the twenty CLI emits for logic
functions. Mirrors the **exact** esbuild config used by `twenty-sdk`
(`packages/twenty-sdk/src/cli/utilities/build/common/build-application.ts`):
`bundle: true`, `splitting: false`, `format: 'esm'`, `platform: 'node'`,
`external: LOGIC_FUNCTION_EXTERNAL_MODULES`, plus the same Node ESM/CJS banner.

## Reproduce

```bash
# 1. Build the SDK locally (produces packages/twenty-sdk/dist/)
npx nx run twenty-sdk:build

# 2. Build the logic-function variants
cd packages/twenty-apps/internal/bundle-investigation
node scripts/build-variants.mjs

# 3. Break down what's in each bundle
node scripts/analyze-metafile.mjs
```

## Findings

| Variant                 | What it imports                                                                | Bundle      |
| ----------------------- | ------------------------------------------------------------------------------ | ----------- |
| `01-bare`               | `defineLogicFunction` from `twenty-sdk/define`                                 | **1.6 KB**  |
| `02-with-sdk-client`    | + `CoreApiClient` from `twenty-client-sdk/core` (external)                     | 1.9 KB      |
| `03-fetch-issues`       | + GitHub GraphQL fetch + JWT signing + 2 mutations                             | 5.8 KB      |
| `04-deep-import`        | `defineLogicFunction` from per-module `dist/define/logic-functions/...`        | 1.6 KB      |
| `05-via-define-subpath` | `defineLogicFunction` from public subpath `twenty-sdk/define`                  | 1.7 KB      |

### What changed

Originally the `01-bare` baseline was **1.18 MB** because the SDK was published
as a single bundled barrel and `twenty-sdk/package.json` had no `"sideEffects"`
field, so esbuild conservatively assumed every module-level statement could
have side effects and refused to drop the front-component / zod chunks even
when nothing the user imported referenced them.

Two changes brought it down to **1.6 KB** (~735× reduction):

1. **`"sideEffects": false`** added to `twenty-sdk/package.json`, so esbuild
   can prove there is nothing to keep around when consumers don't reference an
   export.
2. **Per-purpose vite configs (`vite.config.define.ts` and
   `vite.config.front-component.ts`) emit with `preserveModules: true`**, so
   each leaf module ships as its own `.mjs` file under
   `dist/define/**` and `dist/front-component/**`. Consumers' bundlers can
   then tree-shake at the leaf level instead of bundling the whole barrel.

## Files

- `src/logic-functions/01-bare.ts` — bare-minimum logic function
- `src/logic-functions/02-with-sdk-client.ts` — + `CoreApiClient` query
- `src/logic-functions/03-fetch-issues.ts` — full clone of
  `twenty-eng/fetch-issues` (GraphQL, JWT signing, batch upserts)
- `src/logic-functions/04-deep-import.ts` — references the per-module dist
  directly to set a tree-shaken baseline
- `src/logic-functions/05-via-define-subpath.ts` — same baseline reached via
  the public `twenty-sdk/define` subpath
- `scripts/build-variants.mjs` — runs esbuild with the same options the
  twenty-sdk CLI uses
- `scripts/analyze-metafile.mjs` — pretty-prints each metafile (top
  packages + top files)
