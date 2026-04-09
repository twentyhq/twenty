## ESLint

ESLint-specific guidance for `nx import`. For generic import issues (root deps, pnpm globs, project references), see `SKILL.md`.

---

### How `@nx/eslint/plugin` Works

`@nx/eslint/plugin` scans for ESLint config files and creates a lint target for each project. It detects **both** flat config files (`eslint.config.{js,mjs,cjs,ts,mts,cts}`) and legacy config files (`.eslintrc.{json,js,cjs,mjs,yml,yaml}`).

**Plugin options (set during `nx add @nx/eslint`):**

```json
{
  "plugin": "@nx/eslint/plugin",
  "options": {
    "targetName": "eslint:lint"
  }
}
```

**Auto-installation**: `nx import` auto-detects ESLint config files and offers to install `@nx/eslint`. Accept the offer — it registers the plugin and updates `namedInputs.production` to exclude ESLint config files.

---

### Duplicate `lint` and `eslint:lint` Targets

After import, projects will have **two** lint-related targets if the source `package.json` has a `"lint"` npm script:

- `eslint:lint` — inferred by `@nx/eslint/plugin`; has proper caching and input/output tracking
- `lint` — created by Nx from the npm script via `nx:run-script`; no caching intelligence, just wraps `npm run lint`

**Fix**: Remove the `"lint"` script from each project's `package.json`. Keep `"lint:fix"` if present — there is no plugin-inferred equivalent for auto-fixing.

---

### Legacy `.eslintrc.*` Configs Linting Generated Files

When `@nx/eslint/plugin` runs `eslint .` on a project with a legacy `.eslintrc.*` config that uses `parserOptions.project`, it tries to lint **all** files in the project directory including:

- Generated `dist/**/*.d.ts` files (not in tsconfig `include`)
- The `.eslintrc.js` config file itself (not in tsconfig `include`)

This causes `Parsing error: ESLint was configured to run on X using parserOptions.project, however that TSConfig does not include this file`.

**Fix**: Add `ignorePatterns` to the `.eslintrc.*` config:

```json
// .eslintrc.json
{
  "ignorePatterns": ["dist/**"]
}
```

```js
// .eslintrc.js — also ignore the config file itself since module.exports isn't in tsconfig
module.exports = {
  ignorePatterns: ['dist/**', '.eslintrc.js'],
  // ...
};
```

---

### Flat Config `.cjs` Files Self-Linting

When a project uses `eslint.config.cjs` (CJS flat config), `eslint .` lints the config file itself. The `require()` call on line 1 triggers `@typescript-eslint/no-require-imports`.

**Fix**: Add the config filename to the top-level `ignores` array:

```js
module.exports = tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.cjs'],
  },
  // ...
);
```

The same applies to `eslint.config.js` in a CJS project (no `"type": "module"`) if it uses `require()`.

---

### `typescript-eslint` Version Conflict With ESLint 9

`typescript-eslint@7.x` declares `peerDependencies: { "eslint": "^8.56.0" }`, but it is commonly used alongside `"eslint": "^9.0.0"`. npm treats this as a hard peer dep conflict and refuses to install.

**Root cause**: `@nx/eslint` init adds `eslint@~8.57.0` at the workspace root (for its own peer deps). Workspace packages that request `eslint@^9.0.0` + `typescript-eslint@^7.0.0` trigger the conflict when npm resolves their deps.

**Fix**: Upgrade `typescript-eslint` from `^7.0.0` to `^8.0.0` directly in the affected workspace package's `package.json`. The `tseslint.config()` API and `tseslint.configs.recommended` are identical between v7 and v8 — no config changes needed.

```json
// packages/my-package/package.json
{
  "devDependencies": {
    "typescript-eslint": "^8.0.0"
  }
}
```

**Note**: npm's root-level `"overrides"` field does not force versions for workspace packages' direct dependencies — update each package.json individually.

---

### Mixed ESLint v8 and v9 in One Workspace

Legacy v8 and flat-config v9 packages can coexist in the same workspace. Each package resolves its own `eslint` version. The root `eslint@~8.57.0` (added by `@nx/eslint` init) is used by legacy v8 packages; v9 packages get their own hoisted `eslint@9`.

`@nx/eslint/plugin` infers `eslint:lint` targets for **both** config formats. Legacy packages run ESLint v8 with `.eslintrc.*`; flat-config packages run ESLint v9 with `eslint.config.*`. No special nx.json configuration is needed to support both simultaneously.
