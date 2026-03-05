# Oxlint Migration TODO

This file tracks what was lost or temporarily disabled during the ESLint to Oxlint migration, and what needs to be re-activated or addressed.

## Temporarily Disabled Rules

### twenty-front

| Rule | Reason | Violations | Auto-fixable |
|------|--------|------------|-------------|
| `twenty/sort-css-properties-alphabetically` | 578 pre-existing violations | 578 | Yes |

### twenty-server

| Rule | Reason | Violations | Auto-fixable |
|------|--------|------------|-------------|
| `typescript/consistent-type-imports` | 3814 pre-existing violations (imports not using `import type`) | 3814 | Yes |
| `twenty/max-consts-per-file` | 94 pre-existing violations (constant files with >1 export) | 94 | No |

## Dropped ESLint Plugins (No Oxlint Equivalent)

These ESLint plugins were in use but have no oxlint equivalent. Consider whether alternative tooling is needed.

| Plugin | Where Used | Notes |
|--------|-----------|-------|
| `prettier/prettier` | All packages | Run Prettier separately (already in CI/editor via format-on-save) |
| `lingui/*` | Frontend, emails | i18n extraction rules — no equivalent |
| `@stylistic/*` | Server | Formatting rules (indentation, spacing) — use Prettier instead |
| `import/order` | Server | Import sorting — no equivalent |
| `simple-import-sort/imports` | Server | Import sorting — no equivalent |
| `prefer-arrow/prefer-arrow-functions` | Frontend | Arrow function preference — no equivalent |
| `eslint-plugin-mdx` | Docs | MDX linting — not supported by oxlint |
| `@next/next/*` | Website | Next.js specific rules — not supported by oxlint |
| `eslint-plugin-unused-imports` | Frontend | Unused import removal — partially covered by `no-unused-vars` |
| `eslint-plugin-storybook` | Frontend | Storybook best practices — no equivalent |
| `eslint-plugin-jsx-a11y` | Frontend | Accessibility rules — no equivalent |
| `eslint-plugin-react-refresh` | Frontend | React Refresh boundary rules — no equivalent |

## IDE Integration

The `oxc.oxc-vscode` extension provides inline diagnostics for built-in oxlint rules but does **not** yet support `jsPlugins` (custom `twenty/*` rules). Custom rule violations are only caught by `nx lint` and CI.

## Re-activation Plan

1. **Sort CSS properties** (`twenty-front`): Run `npx nx lint twenty-front --configuration=fix` to auto-fix all 578 violations, then re-enable the rule.
2. **Consistent type imports** (`twenty-server`): Run `npx nx lint twenty-server --configuration=fix` to auto-fix all 3814 violations, then re-enable the rule.
3. **Max consts per file** (`twenty-server`): Manually split 94 constant files to have at most 1 exported const each, then re-enable the rule.
