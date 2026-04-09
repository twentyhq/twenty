## Turborepo

- Nx replaces Turborepo task orchestration, but a clean migration requires handling Turborepo's config packages.
- Migration guide: https://nx.dev/docs/guides/adopting-nx/from-turborepo#easy-automated-migration-example
- Since Nx replaces Turborepo, all turbo config files and config packages become dead code and should be removed.

## The Config-as-Package Pattern

Turborepo monorepos ship with internal workspace packages that share configuration:

- **`@repo/typescript-config`** (or similar) — tsconfig files (`base.json`, `nextjs.json`, `react-library.json`, etc.)
- **`@repo/eslint-config`** (or similar) — ESLint config files and all ESLint plugin dependencies

These are not code libraries. They distribute config via Node module resolution (e.g., `"extends": "@repo/typescript-config/nextjs.json"`). This is the **default** Turborepo pattern — expect it in virtually every Turborepo import. Package names vary — check `package.json` files to identify the actual names.

## Check for Root Config Files First

**Before doing any config merging, check whether the destination workspace uses shared root configuration.** This decides how to handle the config packages.

- If the workspace has a root `tsconfig.base.json` and/or root `eslint.config.mjs` that projects extend, merge the config packages into these root configs (see steps below).
- If the workspace does NOT have root config files — each project manages its own configuration independently (similar to Turborepo). In this case, **do not create root config files or merge into them**. Just remove turbo-specific parts (`turbo.json`, `eslint-plugin-turbo`) and leave the config packages in place, or ask the user how they want to handle them.

If unclear, check for the presence of `tsconfig.base.json` at the root or ask the user.

## Merging TypeScript Config (Only When Root tsconfig.base.json Exists)

The config package contains a hierarchy of tsconfig files. Each project extends one via package name.

1. **Read the config package** — trace the full inheritance chain (e.g., `nextjs.json` extends `base.json`).
2. **Update root `tsconfig.base.json`** — absorb `compilerOptions` from the base config. Add Nx `paths` for cross-project imports (Turborepo doesn't use path aliases, Nx relies on them).
3. **Update each project's `tsconfig.json`**:
   - Change `"extends"` from `"@repo/typescript-config/<variant>.json"` to the relative path to root `tsconfig.base.json`.
   - Inline variant-specific overrides from the intermediate config (e.g., Next.js: `"module": "ESNext"`, `"moduleResolution": "Bundler"`, `"jsx": "preserve"`, `"noEmit": true`; React library: `"jsx": "react-jsx"`).
   - Preserve project-specific settings (`outDir`, `include`, `exclude`, etc.).
4. **Delete the config package** and remove it from all `devDependencies`.

## Merging ESLint Config (Only When Root eslint.config Exists)

The config package centralizes ESLint plugin dependencies and exports composable flat configs.

1. **Read the config package** — identify exported configs, plugin dependencies, and inheritance.
2. **Update root `eslint.config.mjs`** — absorb base rules (JS recommended, TypeScript-ESLint, Prettier, etc.). Drop `eslint-plugin-turbo`.
3. **Update each project's `eslint.config.mjs`** — switch from importing `@repo/eslint-config/<variant>` to extending the root config, adding framework-specific plugins inline.
4. **Move ESLint plugin dependencies** from the config package to root `devDependencies`.
5. If `@nx/eslint` plugin is configured with inferred targets, remove `"lint"` scripts from project `package.json` files.
6. **Delete the config package** and remove it from all `devDependencies`.

## General Cleanup

- Remove turbo-specific dependencies: `turbo`, `eslint-plugin-turbo`.
- Delete all `turbo.json` files (root and per-package).
- Run workspace validation (`nx run-many -t build lint test typecheck`) to confirm nothing broke.

## Key Pitfalls

- **Trace the full inheritance chain** before inlining — check what each variant inherits from the base.
- **Module resolution changes** — from Node package resolution (`@repo/...`) to relative paths (`../../tsconfig.base.json`).
- **ESLint configs are JavaScript, not JSON** — handle JS imports, array spreading, and plugin objects when merging.

Helpful docs:

- https://nx.dev/docs/guides/adopting-nx/from-turborepo
