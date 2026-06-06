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

## Source Layout

Add these alongside the scaffolded `src/{fields,objects,logic-functions,front-components,page-layouts,navigation-menu-items,constants}/` as needed:

- `src/utils/` — pure helpers as `<name>.util.ts`, kept flat.
- `src/types/` — one PascalCase type per file.
- `src/<service>-client/` — wrappers around external SDKs or HTTP clients. One folder per service, matching Twenty's `*-client` convention (`redis-client/`, `sdk-client/`, ...).
- Tests as `*.spec.ts` in sibling `__tests__/` folders next to the code they cover.

Filenames are kebab-case; conventional suffixes are `.util.ts`, `.dto.ts`, `.service.ts`, `.spec.ts` — matching the Twenty backend.

### One Export Per File

Every helper, type, and client file exports exactly one thing. The rule counts exports, not declarations — there are no exceptions for `utils/`, `types/`, or `<service>-client/`.

- Never put multiple function exports in the same file. One function per file, each with its own sibling spec.
- A file must never export more than one thing. A local (non-exported) type used only by the util may live in the same file, but the moment a type is exported or reused elsewhere it moves to `src/types/<name>.ts` while the util stays in `src/utils/<name>.util.ts`.

```ts
// ❌ Bad — src/utils/parse-company.util.ts exports a type and a util
export type ParsedCompany = { id: string; name: string };
export const parseCompany = (raw: RawCompany): ParsedCompany => { /* ... */ };

// ✅ Good — src/utils/parse-company.util.ts (one export; the type is local)
type ParsedCompany = { id: string; name: string };

export const parseCompany = (raw: RawCompany): ParsedCompany => { /* ... */ };

// ✅ Good — when the type is shared, split it
// src/types/parsed-company.ts (one PascalCase type)
export type ParsedCompany = { id: string; name: string };

// src/utils/parse-company.util.ts (one util)
import { type ParsedCompany } from 'src/types/parsed-company';

export const parseCompany = (raw: RawCompany): ParsedCompany => { /* ... */ };
```

Entity files are consistent with this rule: front components, logic functions, and post-install hooks use a single `export default define...()`, which is one export.

Files inside `src/types/` use plain `<name>.ts` (one PascalCase type per file) — no `.type.ts` suffix. Files inside `src/<service>-client/` also use plain `<name>.ts`; the folder name carries the suffix, so do not repeat it on the file.

When field definitions differ only by `objectUniversalIdentifier` and label, replace them with a factory in `src/fields/field-factories.ts`.

Read secrets through the application-config helper, not raw `process.env`.

## Boundaries

- Do not scaffold a new app from this workflow. Use `create-app` first when the app does not exist.
- Do not guess generated entity shapes when the CLI or docs can provide them.
- Keep app changes scoped to the requested feature and its required registrations.

## Validation Checklist

Once all edits for the change are complete, run lint and typecheck once at the end (not after each individual edit), then sync the app to verify the definitions are valid:

```bash
yarn twenty dev:typecheck
yarn lint
yarn twenty dev --once
```

`yarn twenty dev:typecheck` checks generated app types and `yarn lint` checks local lint rules. `yarn twenty dev --once` then builds the app and pushes entity definitions to the active remote; if any definition is invalid, the sync reports the error. Run all three a single time once every edit is done, not repeatedly after each step.

When the user explicitly asks to run tests, follow `tests.md`: unit tests may use the package's unit-test script, and the full suite must run with `TWENTY_API_URL=http://localhost:2021` against the isolated test instance.

Switch to `manage-app` and use `../manage-app/cli-and-sync.md` for sync or remote troubleshooting.

Tests are not part of sync validation but should cover `src/utils/` helpers and post-install hook idempotency. See `tests.md`.
