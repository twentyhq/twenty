---
name: nx-import
description: Import, merge, or combine repositories into an Nx workspace using nx import. USE WHEN the user asks to adopt Nx across repos, move projects into a monorepo, or bring code/history from another repository.
---

## Quick Start

- `nx import` brings code from a source repository or folder into the current workspace, preserving commit history.
- After nx `22.6.0`, `nx import` responds with .ndjson outputs and follow-up questions. For earlier versions, always run with `--no-interactive` and specify all flags directly.
- Run `nx import --help` for available options.
- Make sure the destination directory is empty before importing.
  EXAMPLE: target has `libs/utils` and `libs/models`; source has `libs/ui` and `libs/data-access` — you cannot import `libs/` into `libs/` directly. Import each source library individually.

Primary docs:

- https://nx.dev/docs/guides/adopting-nx/import-project
- https://nx.dev/docs/guides/adopting-nx/preserving-git-histories

Read the nx docs if you have the tools for it.

## Import Strategy

**Subdirectory-at-a-time** (`nx import <source> apps --source=apps`):

- **Recommended for monorepo sources** — files land at top level, no redundant config
- Caveats: multiple import commands (separate merge commits each); dest must not have conflicting directories; root configs (deps, plugins, targetDefaults) not imported
- **Directory conflicts**: Import into alternate-named dir (e.g. `imported-apps/`), then rename

**Whole repo** (`nx import <source> imported --source=.`):

- **Only for non-monorepo sources** (single-project repos)
- For monorepos, creates messy nested config (`imported/nx.json`, `imported/tsconfig.base.json`, etc.)
- If you must: keep imported `tsconfig.base.json` (projects extend it), prefix workspace globs and executor paths

### Directory Conventions

- **Always prefer the destination's existing conventions.** Source uses `libs/`but dest uses `packages/`? Import into `packages/` (`nx import <source> packages/foo --source=libs/foo`).
- If dest has no convention (empty workspace), ask the user.

### Application vs Library Detection

Before importing, identify whether the source is an **application** or a **library**:

- **Applications**: Deployable end products. Common indicators:
  - _Frontend_: `next.config.*`, `vite.config.*` with a build entry point, framework-specific app scaffolding (CRA, Angular CLI app, etc.)
  - _Backend (Node.js)_: Express/Fastify/NestJS server entrypoint, no `"exports"` field in `package.json`
  - _JVM_: Maven `pom.xml` with `<packaging>jar</packaging>` or `<packaging>war</packaging>` and a `main` class; Gradle `application` plugin or `mainClass` setting
  - _.NET_: `.csproj`/`.fsproj` with `<OutputType>Exe</OutputType>` or `<OutputType>WinExe</OutputType>`
  - _General_: Dockerfile, a runnable entrypoint, no public API surface intended for import by other projects
- **Libraries**: Reusable packages consumed by other projects. Common indicators: `"main"`/`"exports"` in `package.json`, Maven/Gradle packaging as a library jar, .NET `<OutputType>Library</OutputType>`, named exports intended for import by other packages.

**Destination directory rules**:

- Applications → `apps/<name>`. Check workspace globs (e.g. `pnpm-workspace.yaml`, `workspaces` in root `package.json`) for an existing `apps/*` entry.
  - If `apps/*` is **not** present, add it before importing: update the workspace glob config and commit (or stage) the change.
  - Example: `nx import <source> apps/my-app --source=packages/my-app`
- Libraries → follow the dest's existing convention (`packages/`, `libs/`, etc.).

## Common Issues

### pnpm Workspace Globs (Critical)

`nx import` adds the imported directory itself (e.g. `apps`) to `pnpm-workspace.yaml`, **NOT** glob patterns for packages within it. Cross-package imports will fail with `Cannot find module`.

**Fix**: Replace with proper globs from the source config (e.g. `apps/*`, `libs/shared/*`), then `pnpm install`.

### Root Dependencies and Config Not Imported (Critical)

`nx import` does **NOT** merge from the source's root:

- `dependencies`/`devDependencies` from `package.json`
- `targetDefaults` from `nx.json` (e.g. `"@nx/esbuild:esbuild": { "dependsOn": ["^build"] }` — critical for build ordering)
- `namedInputs` from `nx.json` (e.g. `production` exclusion patterns for test files)
- Plugin configurations from `nx.json`

**Fix**: Diff source and dest `package.json` + `nx.json`. Add missing deps, merge relevant `targetDefaults` and `namedInputs`.

### TypeScript Project References

After import, run `nx sync --yes`. If it reports nothing but typecheck still fails, `nx reset` first, then `nx sync --yes` again.

### Explicit Executor Path Fixups

Inferred targets (via Nx plugins) resolve config relative to project root — no changes needed. Explicit executor targets (e.g. `@nx/esbuild:esbuild`) have workspace-root-relative paths (`main`, `outputPath`, `tsConfig`, `assets`, `sourceRoot`) that must be prefixed with the import destination directory.

### Plugin Detection

- **Whole-repo import**: `nx import` detects and offers to install plugins. Accept them.
- **Subdirectory import**: Plugins NOT auto-detected. Manually add with `npx nx add @nx/PLUGIN`. Check `include`/`exclude` patterns — defaults won't match alternate directories (e.g. `apps-beta/`).
- Run `npx nx reset` after any plugin config changes.

### Redundant Root Files (Whole-Repo Only)

Whole-repo import brings ALL source root files into the dest subdirectory. Clean up:

- `pnpm-lock.yaml` — stale; dest has its own lockfile
- `pnpm-workspace.yaml` — source workspace config; conflicts with dest
- `node_modules/` — stale symlinks pointing to source filesystem
- `.gitignore` — redundant with dest root `.gitignore`
- `nx.json` — source Nx config; dest has its own
- `README.md` — optional; keep or remove

**Don't blindly delete** `tsconfig.base.json` — imported projects may extend it via relative paths.

### Root ESLint Config Missing (Subdirectory Import)

Subdirectory import doesn't bring the source's root `eslint.config.mjs`, but project configs reference `../../eslint.config.mjs`.

**Fix order**:

1. Install ESLint deps first: `pnpm add -wD eslint@^9 @nx/eslint-plugin typescript-eslint` (plus framework-specific plugins)
2. Create root `eslint.config.mjs` (copy from source or create with `@nx/eslint-plugin` base rules)
3. Then `npx nx add @nx/eslint` to register the plugin in `nx.json`

Install `typescript-eslint` explicitly — pnpm's strict hoisting won't auto-resolve this transitive dep of `@nx/eslint-plugin`.

### ESLint Version Pinning (Critical)

**Pin ESLint to v9** (`eslint@^9.0.0`). ESLint 10 breaks `@nx/eslint` and many plugins with cryptic errors like `Cannot read properties of undefined (reading 'version')`.

`@nx/eslint` may peer-depend on ESLint 8, causing the wrong version to resolve. If lint fails with `Cannot read properties of undefined (reading 'allow')`, add `pnpm.overrides`:

```json
{ "pnpm": { "overrides": { "eslint": "^9.0.0" } } }
```

### Dependency Version Conflicts

After import, compare key deps (`typescript`, `eslint`, framework-specific). If dest uses newer versions, upgrade imported packages to match (usually safe). If source is newer, may need to upgrade dest first. Use `pnpm.overrides` to enforce single-version policy if desired.

### Module Boundaries

Imported projects may lack `tags`. Add tags or update `@nx/enforce-module-boundaries` rules.

### Project Name Collisions (Multi-Import)

Same `name` in `package.json` across source and dest causes `MultipleProjectsWithSameNameError`. **Fix**: Rename conflicting names (e.g. `@org/api` → `@org/teama-api`), update all dep references and import statements, `pnpm install`. The root `package.json` of each imported repo also becomes a project — rename those too.

### Workspace Dep Import Ordering

`pnpm install` fails during `nx import` if a `"workspace:*"` dependency hasn't been imported yet. File operations still succeed. **Fix**: Import all projects first, then `pnpm install --no-frozen-lockfile`.

### `.gitkeep` Blocking Subdirectory Import

The TS preset creates `packages/.gitkeep`. Remove it and commit before importing.

### Frontend tsconfig Base Settings (Critical)

The TS preset defaults (`module: "nodenext"`, `moduleResolution: "nodenext"`, `lib: ["es2022"]`) are incompatible with frontend frameworks (React, Next.js, Vue, Vite). After importing frontend projects, verify the dest root `tsconfig.base.json`:

- **`moduleResolution`**: Must be `"bundler"` (not `"nodenext"`)
- **`module`**: Must be `"esnext"` (not `"nodenext"`)
- **`lib`**: Must include `"dom"` and `"dom.iterable"` (frontend projects need these)
- **`jsx`**: `"react-jsx"` for React-only workspaces, per-project for mixed frameworks

For **subdirectory imports**, the dest root tsconfig is authoritative — update it. For **whole-repo imports**, imported projects may extend their own nested `tsconfig.base.json`, making this less critical.

If the dest also has backend projects needing `nodenext`, use per-project overrides instead of changing the root.

**Gotcha**: TypeScript does NOT merge `lib` arrays — a project-level override **replaces** the base array entirely. Always include all needed entries (e.g. `es2022`, `dom`, `dom.iterable`) in any project-level `lib`.

### `@nx/react` Typings for Libraries

React libraries generated with `@nx/react:library` reference `@nx/react/typings/cssmodule.d.ts` and `@nx/react/typings/image.d.ts` in their tsconfig `types`. These fail with `Cannot find type definition file` unless `@nx/react` is installed in the dest workspace.

**Fix**: `pnpm add -wD @nx/react`

### Jest Preset Missing (Subdirectory Import)

Nx presets create `jest.preset.js` at the workspace root, and project jest configs reference it (e.g. `../../jest.preset.js`). Subdirectory import does NOT bring this file.

**Fix**:

1. Run `npx nx add @nx/jest` — registers `@nx/jest/plugin` in `nx.json` and updates `namedInputs`
2. Create `jest.preset.js` at workspace root (see `references/JEST.md` for content) — `nx add` only creates this when a generator runs, not on bare `nx add`
3. Install test runner deps: `pnpm add -wD jest jest-environment-jsdom ts-jest @types/jest`
4. Install framework-specific test deps as needed (see `references/JEST.md`)

For deeper Jest issues (tsconfig.spec.json, Babel transforms, CI atomization, Jest vs Vitest coexistence), see `references/JEST.md`.

### Target Name Prefixing (Whole-Repo Import)

When importing a project with existing npm scripts (`build`, `dev`, `start`, `lint`), Nx plugins auto-prefix inferred target names to avoid conflicts: e.g. `next:build`, `vite:build`, `eslint:lint`.

**Fix**: Remove the Nx-rewritten npm scripts from the imported `package.json`, then either:

- Accept the prefixed names (e.g. `nx run app:next:build`)
- Rename plugin target names in `nx.json` to use unprefixed names

## Non-Nx Source Issues

When the source is a plain pnpm/npm workspace without `nx.json`.

### npm Script Rewriting (Critical)

Nx rewrites `package.json` scripts during init, creating broken commands (e.g. `vitest run` → `nx test run`). **Fix**: Remove all rewritten scripts — Nx plugins infer targets from config files.

### `noEmit` → `composite` + `emitDeclarationOnly` (Critical)

Plain TS projects use `"noEmit": true`, incompatible with Nx project references.

**Symptoms**: "typecheck target is disabled because one or more project references set 'noEmit: true'" or TS6310.

**Fix** in **all** imported tsconfigs:

1. Remove `"noEmit": true`. If inherited via extends chain, set `"noEmit": false` explicitly.
2. Add `"composite": true`, `"emitDeclarationOnly": true`, `"declarationMap": true`
3. Add `"outDir": "dist"` and `"tsBuildInfoFile": "dist/tsconfig.tsbuildinfo"`
4. Add `"extends": "../../tsconfig.base.json"` if missing. Remove settings now inherited from base.

### Stale node_modules and Lockfiles

`nx import` may bring `node_modules/` (pnpm symlinks pointing to the source filesystem) and `pnpm-lock.yaml` from the source. Both are stale.

**Fix**: `rm -rf imported/node_modules imported/pnpm-lock.yaml imported/pnpm-workspace.yaml imported/.gitignore`, then `pnpm install`.

### ESLint Config Handling

- **Legacy `.eslintrc.json` (ESLint 8)**: Delete all `.eslintrc.*`, remove v8 deps, create flat `eslint.config.mjs`.
- **Flat config (`eslint.config.js`)**: Self-contained configs can often be left as-is.
- **No ESLint**: Create both root and project-level configs from scratch.

### TypeScript `paths` Aliases

Nx uses `package.json` `"exports"` + pnpm workspace linking instead of tsconfig `"paths"`. If packages have proper `"exports"`, paths are redundant. Otherwise, update paths for the new directory structure.

## Technology-specific Guidance

Identify technologies in the source repo, then read and apply the matching reference file(s).

Available references:

- `references/ESLINT.md` — ESLint projects: duplicate `lint`/`eslint:lint` targets, legacy `.eslintrc.*` linting generated files, flat config `.cjs` self-linting, `typescript-eslint` v7/v9 peer dep conflict, mixed ESLint v8+v9 in one workspace.
- `references/GRADLE.md`
- `references/JEST.md` — Jest testing: `@nx/jest/plugin` setup, jest.preset.js, testing deps by framework, tsconfig.spec.json, Jest vs Vitest coexistence, Babel transforms, CI atomization.
- `references/NEXT.md` — Next.js projects: `@nx/next/plugin` targets, `withNx`, Next.js TS config (`noEmit`, `jsx: "preserve"`), auto-installing deps via wrong PM, non-Nx `create-next-app` imports, mixed Next.js+Vite coexistence.
- `references/TURBOREPO.md`
- `references/VITE.md` — Vite projects (React, Vue, or both): `@nx/vite/plugin` typecheck target, `resolve.alias`/`__dirname` fixes, framework deps, Vue-specific setup, mixed React+Vue coexistence.
