## Jest

Jest-specific guidance for `nx import`. For the basic "Jest Preset Missing" fix (create `jest.preset.js`, install deps), see `SKILL.md`. This file covers deeper Jest integration issues.

---

### How `@nx/jest` Works

`@nx/jest/plugin` scans for `jest.config.{ts,js,cjs,mjs,cts,mts}` and creates a `test` target for each project.

**Plugin options:**

```json
{
  "plugin": "@nx/jest/plugin",
  "options": {
    "targetName": "test"
  }
}
```

`npx nx add @nx/jest` does two things:

1. **Registers `@nx/jest/plugin` in `nx.json`** — without this, no `test` targets are inferred
2. Updates `namedInputs.production` to exclude test files

**Gotcha**: `nx add @nx/jest` does NOT create `jest.preset.js` — that file is only generated when you run a generator (e.g. `@nx/jest:configuration`). For imports, you must create it manually (see "Jest Preset" section below).

**Other gotcha**: If you create `jest.preset.js` manually but skip `npx nx add @nx/jest`, the plugin won't be registered and `nx run PROJECT:test` will fail with "Cannot find target 'test'". You need both.

---

### Jest Preset

The preset provides shared Jest configuration (test patterns, ts-jest transform, resolver, jsdom environment).

**Root `jest.preset.js`:**

```js
const nxPreset = require('@nx/jest/preset').default;
module.exports = { ...nxPreset };
```

**Project `jest.config.ts`:**

```ts
export default {
  displayName: 'my-lib',
  preset: '../../jest.preset.js',
  // project-specific overrides
};
```

The `preset` path is relative from the project root to the workspace root. Subdirectory imports preserve the original relative path (e.g. `../../jest.preset.js`), which resolves correctly if the import destination matches the source directory depth.

---

### Testing Dependencies

#### Core (always needed)

```
pnpm add -wD jest ts-jest @types/jest @nx/jest
```

#### Environment-specific

- **DOM testing** (React, Vue, browser libs): `jest-environment-jsdom`
- **Node testing** (APIs, CLIs): no extra deps (Jest defaults to `node` env, but Nx preset defaults to `jsdom`)

#### React testing

```
pnpm add -wD @testing-library/react @testing-library/jest-dom
```

#### React with Babel (non-ts-jest transform)

Some React projects use Babel instead of ts-jest for JSX transformation:

```
pnpm add -wD babel-jest @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript
```

**When**: Project `jest.config` has `transform` using `babel-jest` instead of `ts-jest`. Common in older Nx workspaces and CRA migrations.

#### Vue testing

```
pnpm add -wD @vue/test-utils
```

Vue projects typically use Vitest (not Jest) — see VITE.md.

---

### `tsconfig.spec.json`

Jest projects need a `tsconfig.spec.json` that includes test files:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs",
    "types": ["jest", "node"]
  },
  "include": [
    "jest.config.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
}
```

**Common issues after import:**

- Missing `"types": ["jest", "node"]` — causes `describe`/`it`/`expect` to be unrecognized
- Missing `"module": "commonjs"` — Jest doesn't support ESM by default (ts-jest transpiles to CJS)
- `include` array missing test patterns — TypeScript won't check test files

---

### Jest vs Vitest Coexistence

Workspaces can have both:

- **Jest**: Next.js apps, older React libs, Node libraries
- **Vitest**: Vite-based React/Vue apps and libs

Both `@nx/jest/plugin` and `@nx/vite/plugin` (which infers Vitest targets) coexist without conflicts — they detect different config files (`jest.config.*` vs `vite.config.*`).

**Target naming**: Both default to `test`. If a project somehow has both config files, rename one:

```json
{
  "plugin": "@nx/jest/plugin",
  "options": { "targetName": "jest-test" }
}
```

---

### `@testing-library/jest-dom` — Jest vs Vitest

Projects migrating from Jest to Vitest (or workspaces with both) need different imports:

**Jest** (in `test-setup.ts`):

```ts
import '@testing-library/jest-dom';
```

**Vitest** (in `test-setup.ts`):

```ts
import '@testing-library/jest-dom/vitest';
```

If the source used Jest but the dest workspace uses Vitest for that project type, update the import path. Also add `@testing-library/jest-dom` to tsconfig `types` array.

---

### Non-Nx Source: Test Script Rewriting

Nx rewrites `package.json` scripts during init. Test scripts get broken:

- `"test": "jest"` → `"test": "nx test"` (circular if no executor configured)
- `"test": "vitest run"` → `"test": "nx test run"` (broken — `run` becomes an argument)

**Fix**: Remove all rewritten test scripts. `@nx/jest/plugin` and `@nx/vite/plugin` infer test targets from config files.

---

### CI Atomization

`@nx/jest/plugin` supports splitting tests per-file for CI parallelism:

```json
{
  "plugin": "@nx/jest/plugin",
  "options": {
    "targetName": "test",
    "ciTargetName": "test-ci"
  }
}
```

This creates `test-ci--src/lib/foo.spec.ts` targets for each test file, enabling Nx Cloud distribution. Not relevant during import, but useful for post-import CI setup.

---

### Common Post-Import Issues

1. **"Cannot find target 'test'"**: `@nx/jest/plugin` not registered in `nx.json`. Run `npx nx add @nx/jest` or manually add the plugin entry.

2. **"Cannot find module 'jest-preset'"**: `jest.preset.js` missing at workspace root. Create it (see SKILL.md).

3. **"Cannot find type definition file for 'jest'"**: Missing `@types/jest` or `tsconfig.spec.json` doesn't have `"types": ["jest", "node"]`.

4. **Tests fail with "Cannot use import statement outside a module"**: `ts-jest` not installed or not configured as transform. Check `jest.config.ts` transform section.

5. **Snapshot path mismatches**: After import, `__snapshots__` directories may have paths baked in. Run tests once with `--updateSnapshot` to regenerate.

---

## Fix Order

### Subdirectory Import (Nx Source)

1. `npx nx add @nx/jest` — registers plugin in `nx.json` (does NOT create `jest.preset.js`)
2. Create `jest.preset.js` manually (see "Jest Preset" section above)
3. Install deps: `pnpm add -wD jest jest-environment-jsdom ts-jest @types/jest`
4. Install framework test deps: `@testing-library/react @testing-library/jest-dom` (React), `@vue/test-utils` (Vue)
5. Verify `tsconfig.spec.json` has `"types": ["jest", "node"]`
6. `nx run-many -t test`

### Whole-Repo Import (Non-Nx Source)

1. Remove rewritten test scripts from `package.json`
2. `npx nx add @nx/jest` — registers plugin (does NOT create preset)
3. Create `jest.preset.js` manually
4. Install deps (same as above)
5. Verify/fix `jest.config.*` — ensure `preset` path points to root `jest.preset.js`
6. Verify/fix `tsconfig.spec.json` — add `types`, `module`, `include` if missing
7. `nx run-many -t test`
