# Oxlint Migration TODO

This file tracks what was lost or temporarily disabled during the ESLint to Oxlint migration, and what needs to be re-activated or addressed.

## Temporarily Disabled Rules

### twenty-server

| Rule | Reason | Violations | Auto-fixable |
|------|--------|------------|-------------|
| `twenty/max-consts-per-file` | 94 pre-existing violations across 24 constant files with >1 export | 94 | No |

## Dropped Plugins (No Oxlint Equivalent)

These plugins were in use but have no oxlint equivalent. Consider whether alternative tooling is needed.

| Plugin | Where Used | What It Did | Replacement / Status |
|--------|-----------|-------------|---------------------|
| `eslint-plugin-project-structure` | Frontend | Enforced folder naming and structure conventions for `src/modules/` (kebab-case dirs, allowed subdirs like hooks/utils/components, file naming for hooks/utils). Config still in `folderStructure.json`. | No equivalent. Could be implemented as a custom oxlint rule or a standalone CI script. |
| `lingui/*` | Frontend, emails | i18n extraction and consistency rules | No equivalent |
| `@stylistic/*` | Server | Formatting rules (indentation, spacing) | Use Prettier instead |
| `import/order`, `simple-import-sort/imports` | Server | Import sorting and ordering | No equivalent |
| `prefer-arrow/prefer-arrow-functions` | Frontend | Enforced arrow functions over function declarations | No equivalent |
| `eslint-plugin-mdx` | Docs | MDX file linting | Not supported by oxlint |
| `@next/eslint-plugin-next` | Website | Next.js-specific rules (no `<img>`, link handling, etc.) | Not supported by oxlint |
| `eslint-plugin-unused-imports` | Frontend | Removed unused imports on save | Partially covered by `no-unused-vars` |
| `eslint-plugin-storybook` | Frontend | Storybook best practices (story structure, naming) | No equivalent |
| `eslint-plugin-jsx-a11y` | Frontend | Accessibility rules (alt text, aria, roles, etc.) | Partial equivalent in Oxlint (`jsx-a11y` plugin), but coverage is limited. |
| `eslint-plugin-react-refresh` | Frontend | React Refresh boundary validation (HMR) | No equivalent |

## IDE Integration

The `oxc.oxc-vscode` extension provides inline diagnostics for built-in oxlint rules but does **not** yet support `jsPlugins` (custom `twenty/*` rules). Custom rule violations are only caught by `nx lint` and CI.
