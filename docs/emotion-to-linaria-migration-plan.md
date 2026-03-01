# Emotion → Linaria Migration Plan: twenty-front

## Overview

Migrate all Emotion (`@emotion/styled`, `@emotion/react`) usages in
`packages/twenty-front/src` to Linaria (`@linaria/react`, `@linaria/core`),
following the same patterns already established in the `twenty-ui` package.

**Total files to migrate: ~998**

| Category | Files | Description |
|---|---|---|
| styled-only | 694 | Import `@emotion/styled` but not `useTheme` |
| styled + useTheme | 224 | Import both `@emotion/styled` and `useTheme` |
| useTheme-only | 79 | Import `useTheme` but not `@emotion/styled` |
| css / Global only | 1 | Import `css` or `Global` from `@emotion/react` only |

## Migration Patterns

### 1. `styled` import

```diff
- import styled from '@emotion/styled';
+ import { styled } from '@linaria/react';
```

### 2. Theme access in styled components

Replace Emotion's `({ theme }) =>` prop-function pattern with static
`themeCssVariables` references:

```diff
+ import { themeCssVariables } from 'twenty-ui/theme';

  const StyledTitle = styled.span`
-   color: ${({ theme }) => theme.font.color.primary};
-   font-size: ${({ theme }) => theme.font.size.lg};
+   color: ${themeCssVariables.font.color.primary};
+   font-size: ${themeCssVariables.font.size.lg};
  `;
```

### 3. Spacing

`theme.spacing(N)` is a function; in Linaria it becomes an indexed lookup:

```diff
- margin-top: ${({ theme }) => theme.spacing(3)};
+ margin-top: ${themeCssVariables.spacing[3]};
```

For multi-arg spacing like `theme.spacing(2, 4)` → `"8px 16px"`:

```diff
- padding: ${({ theme }) => theme.spacing(2, 4)};
+ padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
```

### 4. `useTheme` → `useContext(ThemeContext)`

For runtime theme access (icon sizes, animation durations, conditional logic
outside of styled components):

```diff
- import { useTheme } from '@emotion/react';
+ import { useContext } from 'react';
+ import { ThemeContext } from 'twenty-ui/theme';

  const MyComponent = () => {
-   const theme = useTheme();
+   const { theme } = useContext(ThemeContext);
    return <Icon size={theme.icon.size.sm} />;
  };
```

### 5. `css` template literal

```diff
- import { css } from '@emotion/react';
+ import { css } from '@linaria/core';
```

Note: Emotion's `css` returns a serialized style object; Linaria's `css`
returns a class name string. Usage may need to adapt (apply via `className`
instead of the `css` prop).

### 6. `Global` component

Replace Emotion's `<Global styles={...} />` with standard CSS or the
`ThemeCssVariableInjectorEffect` pattern from twenty-ui.

### 7. `ThemeProvider`

The `BaseThemeProvider` already wraps children with both Emotion's
`ThemeProvider` and Linaria's `ThemeContextProvider`. Once all Emotion usages
are gone, the Emotion `ThemeProvider` wrapper can be removed.

---

## PR Breakdown

Files are grouped to keep each PR around ~100 files with consistent review
surface. We start with the simplest, lowest-risk modules.

### PR 1 (~97 files) — Small standalone modules

Low-risk modules with mostly simple `styled`-only patterns.

| Module | Files |
|---|---|
| spreadsheet-import | 28 |
| billing | 10 |
| views | 14 |
| navigation-menu-item | 14 |
| blocknote-editor | 7 |
| advanced-text-editor | 7 |
| favorites | 7 |
| navigation | 4 |
| information-banner | 3 |
| sign-in-background-mock | 3 |

### PR 2 (~100 files) — Auth, tiny modules, loading, testing, pages (part 1)

| Module | Files |
|---|---|
| auth | 19 |
| action-menu | 3 |
| object-metadata | 3 |
| onboarding | 2 |
| workspace | 2 |
| file | 2 |
| error-handler | 2 |
| front-components | 1 |
| geo-map | 1 |
| hooks | 1 |
| loading | 5 |
| testing | 5 |
| pages (first ~55 files) | ~55 |

### PR 3 (~97 files) — Pages (remaining) + activities + AI

| Module | Files |
|---|---|
| pages (remaining ~16 files) | ~16 |
| activities | 53 |
| ai | 28 |

### PR 4 (~100 files) — Command-menu + workflow (part 1)

| Module | Files |
|---|---|
| command-menu | 53 |
| workflow (first ~47 files) | ~47 |

### PR 5 (~115 files) — Workflow (remaining) + page-layout

| Module | Files |
|---|---|
| workflow (remaining ~32 files) | ~32 |
| page-layout | 83 |

### PR 6 (~100 files) — UI module (part 1)

| Module | Files |
|---|---|
| ui (first ~100 files) | ~100 |

### PR 7 (~85 files) — UI module (remaining) + object-record (start)

| Module | Files |
|---|---|
| ui (remaining ~23 files) | ~23 |
| object-record (first ~62 files) | ~62 |

### PR 8 (~100 files) — Object-record (continued)

| Module | Files |
|---|---|
| object-record (next ~100 files) | ~100 |

### PR 9 (~100 files) — Settings (part 1)

| Module | Files |
|---|---|
| settings (first ~100 files) | ~100 |

### PR 10 (~102 files) — Settings (part 2) + final cleanup

| Module | Files |
|---|---|
| settings (remaining ~102 files) | ~102 |
| css/Global-only file | 1 |

### Post-migration PR — Remove Emotion

Once all PRs are merged:

- Remove `ThemeProvider` from `@emotion/react` in `BaseThemeProvider`
- Remove `@emotion/styled` and `@emotion/react` dependencies
- Remove `@styled/typescript-styled-plugin` from tsconfig
- Clean up any remaining Emotion-related configuration

---

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Linaria evaluates at build time; dynamic expressions may fail | Use `themeCssVariables` for all static theme values; pass dynamic values as component props |
| `theme.spacing(N)` function → `themeCssVariables.spacing[N]` index | Pre-computed for values 0–32, 0.5, and 1.5 |
| `useTheme` used for runtime logic (not just styles) | Replace with `useContext(ThemeContext)`, destructure `{ theme }` |
| Multi-arg `theme.spacing(a, b, c)` | Split into individual `themeCssVariables.spacing[N]` references |
| `css` prop differences between Emotion and Linaria | Linaria `css` returns class name; apply via `className` |

---

## Validation Checklist (per PR)

- [ ] `npx nx lint:diff-with-main twenty-front` passes
- [ ] `npx nx typecheck twenty-front` passes
- [ ] `npx nx test twenty-front` passes
- [ ] Visual spot-check of affected components in the app
- [ ] No remaining `@emotion/styled` or `@emotion/react` imports in migrated files
