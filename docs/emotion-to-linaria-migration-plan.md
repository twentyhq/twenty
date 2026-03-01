# Emotion → Linaria Migration Plan: twenty-front

## Overview

Migrate all Emotion (`@emotion/styled`, `@emotion/react`) usages in
`packages/twenty-front/src` to Linaria (`@linaria/react`, `@linaria/core`),
following the same patterns already established in the `twenty-ui` package.

Linaria is a **zero-runtime** CSS-in-JS library. Styles are extracted at
build time by [wyw-in-js](https://wyw-in-js.dev/) (the Vite plugin is
`@wyw-in-js/vite`, already configured in `twenty-front/vite.config.ts`).
This means every expression inside a `styled` or `css` template literal
must be statically evaluable at build time — no runtime theme objects,
no closures over component state, no side-effects.

**Total files to migrate: ~998**

| Category | Files | Description |
|---|---|---|
| styled-only | 694 | Import `@emotion/styled` but not `useTheme` |
| styled + useTheme | 224 | Import both `@emotion/styled` and `useTheme` |
| useTheme-only | 79 | Import `useTheme` but not `@emotion/styled` |
| css / Global only | 1 | Import `css` or `Global` from `@emotion/react` only |

## Theme Architecture

Two build-time utilities produce the theme system:

- **`buildThemeReferencingRootCssVariables`** — walks the theme object and
  builds a nested mirror where every leaf is a `var(--t-xxx)` string
  (evaluated at build time by wyw-in-js)
- **`prepareThemeForRootCssVariableInjection`** — walks the runtime theme
  and collects flat `[--css-variable-name, value]` pairs, injected onto
  `document.documentElement` by `ThemeCssVariableInjectorEffect`

`themeCssVariables` is the build-time object; every leaf resolves to a CSS
`var()` reference. It is safe to use inside `styled` and `css` templates
because wyw-in-js can evaluate it statically.

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

The spacing scale covers integers 0–32 plus `0.5` and `1.5`. Any other
fractional values (`0.25`, `0.75`, `1.25`, `2.5`, `3.5`) must be replaced
with literal pixel values (e.g. `theme.spacing(2.5)` → `10px`).

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

Linaria's `css` (from `@linaria/core`) returns a **class name string**, not
a serialized style object like Emotion's `css`. This has two consequences:

**Standalone usage** — apply via `className`, not the `css` prop:

```diff
- import { css } from '@emotion/react';
+ import { css } from '@linaria/core';

  const myClass = css`
    text-decoration: none;
  `;

- <Link css={myClass} />
+ <Link className={myClass} />
```

**Inside `styled` templates** — do NOT nest `css` tags. Linaria's `css`
returns a class name, not raw CSS text, so interpolating it inside `styled`
produces broken output. Use plain strings instead:

```diff
  // WRONG — css`` returns a class name, not CSS text
  ${({ handle }) =>
    handle === 'left'
-     ? css`left: ${themeCssVariables.spacing[1]};`
-     : css`right: ${themeCssVariables.spacing[1]};`}
+     ? `left: ${themeCssVariables.spacing[1]};`
+     : `right: ${themeCssVariables.spacing[1]};`}
```

### 6. Interpolation return types

wyw-in-js requires prop interpolation functions to return `string | number`.
They must **never** return `false`, `undefined`, or `null`. Replace
short-circuit `&&` with ternary expressions:

```diff
  // WRONG — returns false when condition is false
- ${({ isActive }) => isActive && `background: ${themeCssVariables.color.blue};`}
  // CORRECT
+ ${({ isActive }) => isActive ? `background: ${themeCssVariables.color.blue};` : ''}
```

### 7. Block interpolations (multi-declaration returns)

Linaria wraps each interpolation result in a single CSS custom property
(`var(--xxx)`). An interpolation that returns **multiple CSS declarations**
produces invalid CSS. Split into one interpolation per property:

```diff
  // WRONG — single interpolation returning multiple declarations
- ${({ divider, theme }) => {
-   const border = `1px solid ${theme.border.color.light}`;
-   return divider === 'left' ? `border-left: ${border}` : `border-right: ${border}`;
- }}

  // CORRECT — one interpolation per property
+ border-left: ${({ divider }) =>
+   divider === 'left' ? `1px solid ${themeCssVariables.border.color.light}` : 'none'};
+ border-right: ${({ divider }) =>
+   divider === 'right' ? `1px solid ${themeCssVariables.border.color.light}` : 'none'};
```

### 8. CSS var + unit concatenation

CSS custom properties can't be concatenated with unit suffixes directly
(`var(--x)px` is invalid). Use `calc()` to attach units:

```diff
- transition: background ${themeCssVariables.animation.duration.instant}s ease;
+ transition: background calc(${themeCssVariables.animation.duration.instant} * 1s) ease;
```

### 9. `styled(Component)` requires `className`

Linaria's `styled(Component)` works by passing a generated `className` to
the wrapped component. The component **must** accept and forward a
`className` prop — otherwise the styles are silently lost. If the component
doesn't support it, either add `className` support or use a wrapper div.

Linaria also does **not** support Emotion's `shouldForwardProp` option.
Custom props on HTML elements are automatically filtered by Linaria's
runtime (via `@emotion/is-prop-valid`). For custom components, all props are
forwarded — ensure the wrapped component ignores unknown props gracefully.

### 10. `type Theme` → `type ThemeType`

```diff
- import { type Theme } from '@emotion/react';
+ import { type ThemeType } from 'twenty-ui/theme';
```

### 11. Framer Motion integration

Linaria doesn't support `styled(motion.div)` — wrapping a motion element
with `styled()` causes the component body to be stripped at build time by
wyw-in-js. Define the styled component first, then wrap with
`motion.create()`:

```tsx
const StyledBarBase = styled.div`
  background-color: ${themeCssVariables.font.color.primary};
  height: 100%;
`;

const StyledBar = motion.create(StyledBarBase);
```

### 12. Dynamic styles via CSS variables

When a component needs to compute styles from multiple props with complex
branching logic (e.g. combining `variant`, `accent`, `disabled`, `focus`),
Linaria's prop interpolations become unwieldy. Use a `computeDynamicStyles`
helper that returns a `CSSProperties` object injected via `style={}`,
referenced from the static CSS with `var()`:

```tsx
const StyledButton = styled.button`
  background: var(--btn-bg);
  border-color: var(--btn-border-color);
  &:hover { background: var(--btn-hover-bg); }
`;

const dynamicStyles = useMemo(() => {
  const s = computeButtonDynamicStyles(variant, accent, ...);
  return {
    '--btn-bg': s.background,
    '--btn-hover-bg': s.hoverBackground,
  } as CSSProperties;
}, [variant, accent, ...]);

return <StyledButton style={dynamicStyles} />;
```

### 13. `Global` component

Replace Emotion's `<Global styles={...} />` with standard CSS or the
`ThemeCssVariableInjectorEffect` pattern from twenty-ui.

### 14. `ThemeProvider`

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
| wyw-in-js evaluates at build time; dynamic expressions may fail | Use `themeCssVariables` for static theme values; pass dynamic values as component props or via `style={}` CSS variables |
| `theme.spacing(N)` function → `themeCssVariables.spacing[N]` index | Pre-computed for integers 0–32 plus 0.5 and 1.5; other fractional values → literal pixel values |
| `useTheme` used for runtime logic (not just styles) | Replace with `useContext(ThemeContext)`, destructure `{ theme }` |
| Multi-arg `theme.spacing(a, b, c)` | Split into individual `themeCssVariables.spacing[N]` references |
| `css` tag inside `styled` templates | Linaria `css` returns class name, not CSS text; use plain strings inside `styled` |
| Interpolation returns `false` / `undefined` | wyw-in-js requires `string \| number`; use ternary `? : ''` instead of `&&` |
| Block interpolations (multiple declarations) | Split into one interpolation per CSS property |
| `var(--x)px` concatenation | Use `calc(var(--x) * 1px)` |
| `styled(motion.div)` stripped by wyw-in-js | Use `motion.create(StyledBase)` pattern |
| `styled(Component)` with no `className` prop | Add `className` support to wrapped component or use wrapper div |
| Complex multi-prop style branching | Use `computeDynamicStyles` + `style={}` + `var()` references |

---

## Validation Checklist (per PR)

- [ ] `npx nx lint:diff-with-main twenty-front` passes
- [ ] `npx nx typecheck twenty-front` passes
- [ ] `npx nx test twenty-front` passes
- [ ] Visual spot-check of affected components in the app
- [ ] No remaining `@emotion/styled` or `@emotion/react` imports in migrated files
