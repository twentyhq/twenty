# Klaim CRM theme

The CRM's light appearance uses `klaim-theme.css`, inspired by the supplied
`Klaim_USA_CRM_Offline.html` reference. It is loaded in `src/index.tsx` and the
front-end Storybook preview after Twenty UI's standard theme stylesheets.

Select **Light** in Twenty's appearance settings to see it. **System** uses the
Klaim palette when the operating system is in light mode. Dark mode is unchanged.

| Role | Color |
| --- | --- |
| Canvas | `#f9f9fc` |
| Cards, navigation, and menus | `#ffffff` |
| Primary text | `#2e2d4d` |
| Primary action / hover | `#182842` / `#2a3e5d` |
| Mint accent | `#80eee0` |
| Selection surface | `#e8f8f3` |
| Borders | `#e9e9f0` |
| Purple status | `#6963a5` on `#f0edf9` |

The theme only overrides existing `--t-*` semantic CSS variables under `.light`.
Root-level variables reach body portals and embedded app components as well as
Linaria styles and `useTheme()` consumers. No extra provider is needed; interface
scaling, font sizes, responsive layouts, and keyboard interactions remain owned
by Twenty. Popover scale-in motion and the input focus ring live in `twenty-ui`
and apply to every theme. Radii are redefined inside the squircle `@supports`
block too, otherwise the Klaim values would shrink Chromium's squircle corners.

## Design language

Components follow a "refined premium" direction on top of Base UI, without a
second component library:

- Surfaces: content panels and cards use the primary background, a hairline
  medium border and the light shadow; popovers use the strong shadow and modals
  the super-heavy one.
- Radii: `md` for controls and navigation items, `lg` for cards, panels and
  popovers.
- Motion: one ease-out curve, `EASE_OUT_CSS` in twenty-front and `easing(out)`
  in twenty-ui SCSS, with the theme durations. Only color, shadow, opacity and
  transform animate, and transforms are disabled under reduced motion.
- Focus: `0 0 0 3px var(--t-accent-secondary)` on `:focus-visible`.
- Type: Inter with the `cv05` and `cv11` alternates; tabular figures for
  numbers in data views.

Inter is already bundled locally. The reference's optional Sen heading font is
not added, and no remote fonts or assets are requested. Muted text and status
labels are slightly darker than the reference to improve readability. Neutral
primary buttons are navy; explicit accent actions use a darker mint green so
white labels remain legible.

This is a theme, not a replacement dashboard: it does not change navigation,
records, workflows, workspace logos, or Twenty's page layouts. The original blue
accent token family is mapped to mint within this CRM; other named record colors
retain their default palettes.

To restore Twenty's stock light theme, remove the `klaim-theme.css` imports from
`src/index.tsx` and `.storybook/preview.tsx`.

Run the focused regression tests from the repository root:

```sh
npx jest packages/twenty-front/src/modules/ui/theme/utils/__tests__/klaimTheme.test.ts --config=packages/twenty-front/jest.config.mjs --runInBand
```
