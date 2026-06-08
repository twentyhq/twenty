# twenty-new-ui

> **Status:** Phase 0 — Foundations in progress. The package is scaffolded and builds
> on SCSS Modules + Base UI; the theme layer is ported from `twenty-ui` with a parity
> test, and the size/Storybook/a11y harnesses are wired up. Remaining Phase 0 work: the
> CI diff-table workflow, the `twenty-ui` component inventory, and the `modules/ui` triage.
> The sections below remain the design document for the full effort.

`twenty-new-ui` is the next generation of Twenty's UI library, replacing [`twenty-ui`](../twenty-ui).
It is built on a headless component library and a zero-runtime, CSS-variable styling layer.

## Goals

1. Publish as a standalone, versioned **npm package**.
2. Replace `twenty-ui` in `twenty-front` with **no visual change** (same design, token for token).
3. **Migrate every component** currently exported by `twenty-ui`.
4. **Absorb the generic, reusable UI** currently living in `twenty-front/src/modules/ui` (dropdowns, modals, tab lists, side panels, navigation, field inputs/displays, etc.), decoupling it from application concerns so it ships from the library.
5. Enforce a **quality bar in CI**: bundle size, render/load time, and accessibility, measured against the old library.

## Current state (`twenty-ui`)

| Aspect | Today |
| --- | --- |
| Exports | ~180 components across 13 subpath entry points (`display`, `input`, `layout`, `navigation`, `feedback`, `components`, `theme`, `theme-constants`, `utilities`, `accessibility`, `assets`, `json-visualizer`, `testing`) + 3 CSS files |
| Styling | Linaria (`@linaria/react`) compiled via `@wyw-in-js/vite`; theming via generated `--t-*` CSS variables |
| Behavior | Hand-rolled (modals, menus, tooltips, selects, etc.); `react-tooltip` for tooltips |
| Build | Vite library mode, dual ESM/CJS, `vite-plugin-dts`, auto-generated barrels |
| Icons | `@tabler/icons-react` re-exports + custom icons + Jotai-backed `IconsProvider` |
| Consumption | ~1,721 files in `twenty-front` import it (mostly `display` and `theme-constants`); imported by package name |
| Published | No (`private: true`) |

`twenty-front/src/modules/ui/` (application-level UI) consumes `twenty-ui` today. Its **generic, reusable**
components are now **in scope** — they migrate into `twenty-new-ui` (see [Application-level UI migration](#application-level-ui-migration-twenty-frontsrcmodulesui)).

## Decision 1 — Headless library: Base UI

Adopt **Base UI** ([`mui/base-ui`](https://github.com/mui/base-ui), published to npm as
[`@base-ui/react`](https://base-ui.com), MIT) as the behavioral foundation; build Twenty's visual
design on top of it.

| | Base UI | shadcn/ui | Radix |
| --- | --- | --- | --- |
| Distribution | npm package | copy-paste source | npm package |
| Styling | bring your own | Tailwind | bring your own |
| State styling | `data-*` + `className`-as-function | (underlying primitive) | `data-*` |
| Maintenance | MUI team, full-time; frequent stable releases | community | WorkOS; slower cadence, creators departed |

**Rationale**

- **Publishable and unstyled** — Base UI ships as an npm dependency and imposes no styling, so consumers apply their own tokens. shadcn is copy-paste source (not installable) and Tailwind-coupled; it is suitable only as a scaffolding/reference tool, not the foundation.
- **Active long-term investment** — Base UI is maintained by the team behind Radix, Floating UI, and Material UI. Radix is a viable, still-maintained fallback, but its core authors now work on Base UI and its stable-release cadence has slowed.
- **Modern, broad primitives** — Combobox/Autocomplete with built-in search, Select, Number Field, Navigation Menu, Toast, etc., several of which replace hand-rolled or single-purpose dependencies in `twenty-ui`.
- **`className`-as-function-of-state** pairs cleanly with CSS/SCSS Modules.
- **Small, tree-shakeable dependency tree**; peer-compatible with the repo's React 18.

Pin the latest **stable** release at implementation time; isolate Base UI behind the package's own
component APIs so upgrades stay localized.

## Decision 2 — Styling: SCSS Modules (drop Linaria)

Use **SCSS Modules** (`*.module.scss`) over the existing CSS-variable theme. Drop Linaria.

| Approach | Runtime | Build complexity | Scoping | Verdict |
| --- | --- | --- | --- | --- |
| Linaria (today) | zero | high (Babel + wyw-in-js) | auto | overkill |
| Plain global CSS | zero | none | none (collision risk) | unsafe for a library |
| CSS Modules | zero | none (native Vite) | auto | strong baseline |
| **SCSS Modules** | zero | low (`sass` only) | auto | **recommended** |
| vanilla-extract | zero | medium (TS compile) | auto | viable alternative (typed tokens) |

**Rationale**

- Theming is already CSS variables and component state comes from Base UI as `data-*` attributes, so the two features Linaria provides (JS theming and prop interpolation) are not needed.
- SCSS Modules are zero-runtime and auto-scoped, native to Vite (no Babel/`wyw-in-js`), and faster to build.
- Sass mixins, maps, and `@each` cover variant/size generation and responsive breakpoints.
- Type-safe class names via generated `*.module.scss.d.ts` (`vite-plugin-sass-dts`).

**Conventions:** one `Component.module.scss` per component; tokens only via `var(--t-*)`; state via
`data-*` selectors; multi-variant composition via `clsx` (or `cva` for a typed variants API);
shared `mixins.scss` / `breakpoints.scss`; global unscoped CSS only for theme variables, reset, and keyframes.

## Architecture

```
packages/twenty-new-ui/
├── package.json            # public exports mirror twenty-ui's subpath map
├── project.json            # Nx targets: build, lint, test, storybook, size
├── vite.config.ts          # library mode, no wyw-in-js
├── vitest.config.ts        # storybook component tests
├── .storybook/
├── .size-limit.json        # per-entry bundle budgets
├── scripts/                # generateBarrels.ts
└── src/
    ├── styles/             # global: reset, theme vars, mixins, breakpoints
    ├── theme/ theme-constants/
    ├── display/ input/ layout/ navigation/ feedback/ components/
    ├── accessibility/ utilities/ json-visualizer/ assets/ testing/
```

**Public API parity.** Keep the same subpath exports, component names, and prop signatures as
`twenty-ui` so the final swap is a codemod + dependency rename, not a rewrite of 1,721 files.
Keep auto-generated barrels and dual ESM/CJS + `dts` output.

**Internal changes vs `twenty-ui`:** Linaria → SCSS Modules; hand-rolled behavior + `react-tooltip`
→ Base UI; prefer Base UI/CSS transitions over `framer-motion` where possible; keep the icon system
as-is.

## Theming

`theme-constants` has ~943 importers and must be a drop-in replacement.

- Keep the public API identical: `ThemeProvider`, `ThemeContext`, `useTheme`, the `themeCssVariables` shape, `ThemeType`, color helpers, and the `theme-light.css` / `theme-dark.css` exports.
- Reuse `twenty-ui`'s token values verbatim to guarantee identical design.
- Tokens live in `src/theme/` (`THEME_LIGHT` / `THEME_DARK`); the `--t-*` CSS variables and the `themeCssVariables` accessor are static files mirrored token-for-token from `twenty-ui` (matching `twenty-ui`'s own static-CSS approach).
- A theme parity test asserts the theme CSS and `themeCssVariables` stay identical to `twenty-ui`'s `--t-*` values.

## Component migration map

A full component-by-component inventory with prop signatures is a Phase 0 deliverable. Components
split into two buckets.

**Backed by a Base UI primitive (behavioral):**

| `twenty-ui` | Base UI |
| --- | --- |
| `Modal` | `Dialog` / `AlertDialog` |
| `AppTooltip`, `OverflowingTextWithTooltip` | `Tooltip` (removes `react-tooltip`) |
| `Toggle` | `Switch` |
| `Checkbox` / `Radio` | `Checkbox` / `Radio` (+ groups) |
| `Menu`, `MenuItem` | `Menu` / `ContextMenu` / `Menubar` |
| `TabButton` | `Tabs` |
| `SearchInput`, text inputs | `Input` + `Field` |
| `CardPicker` | `RadioGroup` / `ToggleGroup` |
| `ColorPicker` | `Popover` + custom |
| `ProgressBar` | `Progress` |
| `Avatar`, `AvatarGroup` | `Avatar` |
| `AnimatedExpandableContainer` | `Collapsible` / `Accordion` |

**Pure presentation, built in-house (SCSS Modules):** button family, typography, `Chip`/`Pill`/`Tag`/`LinkChip`,
`Banner`/`Callout`/`Info`/`Status`, `Card`/`Section`/`Separator`, `Loader`, `TintedIconTile`,
`ColorSample`, `Checkmark`, placeholders, the icon system, `CodeEditor` (Monaco), `json-visualizer`,
and the `utilities` / `theme` / `testing` / `accessibility` helpers.

## Application-level UI migration (`twenty-front/src/modules/ui`)

`twenty-front/src/modules/ui` holds ~250 application-level UI building blocks that consume `twenty-ui`
today: `display`, `feedback` (snackbar/dialog managers), `field` (input + display), `input`
(incl. relation picker), `layout` (dropdown, modal, tab-list, side-panel, page, table, resizable-panel,
expandable-list, selectable-list, top-bar, …), `navigation` (drawer, breadcrumb, step-bar, menu-item),
`drag-and-drop`, `suggestion`, `theme`, and `utilities` (hotkey, scroll, focus, responsive, drag-select, …).

These are a **different kind of migration** than the `twenty-ui` swap: they are stateful and
app-coupled — Jotai atoms, hooks, contexts, and (in places) GraphQL/router/Recoil-style state — rather
than pure presentation. The goal is to extract the **generic, reusable** parts into `twenty-new-ui`
while leaving genuinely app-specific wiring in `twenty-front`.

**Approach**

- **Triage, don't lift-and-shift.** Per component, classify as: (a) **generic** → migrate to `twenty-new-ui`; (b) **app-specific** → keep in `twenty-front`; (c) **hybrid** → split a presentational/headless core (library) from an app-wired wrapper (front).
- **Decouple state.** Replace internal Jotai/global state with controlled props (`props down, events up`); where a component needs local state, keep it self-contained. The library must not import app stores, GraphQL, or routing.
- **Prefer Base UI primitives** for behavior already covered there — Dropdown→`Menu`/`Popover`, modal/side-panel→`Dialog`, tab-list→`Tabs`, expandable/selectable lists→`Collapsible`/list patterns, drag-and-drop stays on the existing dnd lib but exposed generically.
- **Same parity bar** as the rest of the package: stories (all states, light/dark), interaction + a11y tests, visual-parity diff, within-budget size entry.

**Out of scope (stays in `twenty-front`):** components bound to domain entities, record/table data fetching,
workspace/router/permission logic, and anything whose only consumer is a single feature screen.

A component-by-component triage of `modules/ui` (generic / app-specific / hybrid, with target subpath
and state-decoupling notes) is a **Phase 0 deliverable**, alongside the `twenty-ui` inventory.

## Hardest components to migrate (risk hotspots)

A predicted ranking of where the effort and risk concentrate, to inform sequencing and staffing. This
is a hypothesis to validate during the Phase 0 inventory/triage, not a final list.

### In `twenty-ui`

| Component | Why it's hard | Migration shape |
| --- | --- | --- |
| `CodeEditor` (`input/code-editor`) | Hard dependency on Monaco; Linaria theme defined via `defineTheme()` bound to Monaco lifecycle | Port Monaco integration ~verbatim; only re-skin via CSS vars — Base UI doesn't apply |
| Button family — `Button` (~560 LOC), `IconButton` (~330), `AnimatedButton` (~520) | Huge Linaria style matrix (variant × accent × inverted × disabled × position, 140+ branches each); router `Link`; framer-motion on the animated one | Establish the canonical "computed class / `cva` + `data-*`" pattern here first; this trio is the project's key inflection point (~30–40% of library effort) |
| `Modal` + `ModalBackdrop` (`layout/modal`) | framer-motion `AnimatePresence`, portal + z-index layering, responsive Linaria sizing | Base UI `Dialog` + CSS transitions; backdrop animation has no direct Base UI equivalent |
| `AnimatedExpandableContainer` | scroll-height measurement + framer-motion height/opacity animation | Base UI `Collapsible` + CSS grid-rows / JS height fallback |
| `AppTooltip`, `OverflowingTextWithTooltip` | `react-tooltip` dependency + overflow detection; Linaria `css` template | Swap to Base UI `Tooltip` (+ Floating UI); behavioral divergence is likely and needs parity tests |
| `JsonNestedNode` (`json-visualizer`) | recursive tree with per-node framer-motion expand/collapse | Recursion is fine; replace animation, keep structure |
| `MenuItem`, `ProgressBar`/`CircularProgressBar`, `Avatar`/`AvatarGroup` | framer-motion micro-animations; `Avatar` uses a Jotai atom for broken-image fallback | CSS transitions; `Avatar` → Base UI `Avatar`, Jotai → local state/props |
| `IconsProvider`, `ThemeProvider` | Jotai-backed icon registry; runtime CSS-var parsing — **every** component depends on them | Low per-unit effort but high blast radius; freeze the public API, swap internals carefully |

Cross-cutting: **~120 files use Linaria prop interpolation** and **~26 use framer-motion** — the two
systemic conversions (→ SCSS Modules, → CSS/Base UI transitions) dominate, not any single component.

### In `twenty-front/src/modules/ui`

Here difficulty is **decoupling from app state**, not visuals. Ranked hardest:

| Area | Why it's hard | Decoupling needed |
| --- | --- | --- |
| `layout/dropdown` | Floating UI positioning + open-state atoms + hotkey scoping; foundational to many features | Generic positioning wrapper; controlled open state; injectable keyboard handling |
| `utilities/hotkey` + `utilities/focus` | Hand-rolled global hotkey **scope stack** and focus stack as shared runtime state | Extract as an injectable system; the rest of the library must not assume the global stack |
| `navigation/navigation-drawer` (~40 files) | Deeply bound to `currentWorkspaceState`, auth, Apollo error handling, multi-workspace switching | Mostly **app-specific** — migrate only the generic drawer shell, leave workspace logic in `twenty-front` |
| `layout/selectable-list` | 2D arrow-key navigation state machine over atom families | Pure grid-position functions + a controlled selection API |
| `layout/expandable-list` | Floating UI + DOM overflow measurement | Layout-agnostic overflow API, drop Floating UI coupling |
| `layout/table` | Generic types but heavy sorting/metadata atoms | Make field-agnostic; lift state out |
| `layout/modal` | `ModalComponentInstanceContext`, click-outside + escape via hotkeys, stacking indices | Injectable container; remove context coupling |
| `layout/resizable-panel`, `utilities/drag-select`, `utilities/scroll` | Direct DOM/pointer manipulation, set CSS vars on `documentElement`, scroll-wrapper atom coupling | Callback/controlled APIs; pure geometry utils; optional scroll coupling |
| `feedback` (snackbar + dialog managers) | Snackbar formats **Apollo** errors; dialog uses framer-motion | Generic error objects; CSS animations |
| `layout/tab-list` | Router `useNavigate`, measurement system, dropdown coupling | Callback-based navigation; extract measurement |
| `input` date pickers (`internal/date`, ~47 files) | `temporal-polyfill`, reads `currentWorkspaceMemberState` for tz/locale | Parameterize locale/timezone via props |

**Probably should NOT migrate (too app-coupled, keep in `twenty-front`):** `field/input` & `field/display`
(bound to `FieldMetadata` / `object-record`), the full navigation-drawer workspace/auth UI, snackbar
Apollo error formatting, and the icon/theme-color pickers tied to Twenty's icon set and theme system.

## Test, benchmark & parity strategy

- **Workbench** — Storybook (`@storybook/react-vite`). Every component has stories covering variants, sizes, and states (via `storybook-addon-pseudo-states`), in light and dark, with `autodocs`.
- **Functional** — component/interaction tests via `@storybook/addon-vitest` (real browser); unit tests (Jest) for hooks/utilities; coverage gate via `@storybook/addon-coverage`.
- **Accessibility** — Storybook a11y addon (axe-core) with `parameters.a11y.test = 'error'` so violations fail CI.
- **Visual parity** — visual regression via Argos (self-hosted) plus a cross-package comparison project that diffs `twenty-new-ui` stories against `twenty-ui` stories with identical names; a pixel-diff threshold is the per-component acceptance gate. See [Visual regression](#visual-regression) below.
- **Performance & size** — `size-limit` per entry point with budgets; tree-shaking fixtures (importing one component must not pull the library); build-time tracking; render benchmarks via React Profiler; load-time via Lighthouse/Playwright on the built Storybook. As one concrete benchmark, a dedicated **stress story** renders a very large number of a single component (e.g. 10,000 buttons) and measures total render time — compared against the `twenty-ui` equivalent and gated against a budget to catch per-instance overhead regressions.

CI surfaces a per-PR diff table (`twenty-ui` vs `twenty-new-ui`) for size, a11y, and visual changes.

## Visual regression

Two Argos projects (on argos.twenty-internal.com) provide visual regression in CI:

1. **`twenty-new-ui`** — pixel diff of `twenty-new-ui` stories against the `main` branch baseline. Catches regressions introduced by a PR.
2. **`twenty-ui-vs-new-ui`** — cross-package comparison. The baseline is always `twenty-ui` screenshots from `main`; PR builds upload `twenty-new-ui` screenshots and diff them against the `twenty-ui` baseline. This shows exactly which components still differ between the two implementations.

For the cross-package comparison to produce meaningful diffs, stories in `twenty-new-ui` must use the **same title hierarchy** as `twenty-ui` (e.g. `UI/Input/Toggle`).

### Local visual diff

Run a pixel diff of `twenty-new-ui` components against `twenty-ui` using the self-hosted Argos instance.

**Prerequisites:**
- AWS SSO configured and logged in (`aws sso login --profile twenty-dev`)
- `twenty-infra/super-cli` cloned (sibling of this repo)

**1. Start the Argos tunnel**

In the `twenty-infra/super-cli` directory:

    yarn cli argos-tunnel

This port-forwards the Argos service to `http://127.0.0.1:4002`.
Wait until the CLI shows "Argos tunnel is running".

**2. Set your Argos token**

Create a `.env` file in `packages/twenty-new-ui/` (gitignored):

    ARGOS_TOKEN=<your-token-from-argos-project-settings>

**3. Run the visual diff**

From the repo root:

    npx nx storybook:visual-diff twenty-new-ui

This builds Storybook, captures screenshots of every story, and uploads
them to Argos with build name `<username>/twenty-new-ui`. The diff
compares against the latest approved baseline.

To run `twenty-ui`'s visual diff in the same Argos instance (to build the
cross-package comparison baseline):

    npx nx storybook:visual-diff twenty-ui

**4. View results**

Open `http://127.0.0.1:4002` in your browser (while the tunnel is running)
to review diffs.

## Build & publishing

- Vite library mode, dual ESM/CJS, `vite-plugin-dts`, `vite-plugin-svgr`; SCSS via Vite's built-in `sass`; no Babel.
- `sideEffects: ["**/*.css", "**/*.scss"]`; emit per-entry CSS plus `style.css` / `theme-light.css` / `theme-dark.css`.
- Public package (remove `private`); ships as `twenty-new-ui` until cut-over, then claims the `twenty-ui` name once the old package is removed.
- **Changesets** for semver + changelog; GitHub Actions release with `npm publish --provenance`.
- Declare `react` / `react-dom` as peer dependencies; validate the `exports`/types map with `publint` + `@arethetypeswrong/cli`.
- Publish the Storybook as living documentation.

## Migration & rollout

1. Build `twenty-new-ui` to parity with the same API surface and design, validated by the parity, a11y, and size suites.
2. Dogfood on a few non-critical `twenty-front` screens behind a temporary alias.
3. Codemod imports `twenty-ui` → `twenty-new-ui` across `twenty-front` (subpaths preserved); handle any changed APIs explicitly.
4. Swap the dependency, run the full test suite + visual diffs, ship.
5. Deprecate and remove `twenty-ui` after a soak period.

## Roadmap

- **Phase 0 — Foundations:** scaffold package + tooling; port the theme layer with parity test; stand up the benchmark/parity/a11y CI harness first; complete the component inventory **and the `modules/ui` triage** (generic / app-specific / hybrid).
- **Phase 1 — Primitives:** icons, typography, button family, status/tag/chip/pill; establish the canonical component pattern.
- **Phase 2 — Behavioral:** Modal, Tooltip, Menu, Tabs, Checkbox, Radio, Switch, inputs/Field, Progress, Avatar, Collapsible.
- **Phase 3 — Long tail:** banners/callout/info, card/section/separator, loader, color/card pickers, code editor, json-visualizer, placeholders, utilities/testing/accessibility.
- **Phase 4 — Application-level UI:** migrate the generic/hybrid components from `twenty-front/src/modules/ui` per the triage — decouple state, split headless cores, swap each behind its existing `@/ui/...` import path.
- **Phase 5 — Hardening & publish:** close gaps; finalize release pipeline; cut `1.0.0`; publish docs.
- **Phase 6 — Cut-over:** dogfood → codemod → swap → remove `twenty-ui`.

A component is done only with: stories (all states, light/dark), passing interaction + a11y tests,
a passing visual-parity diff, and a within-budget size entry.

## Risks

| Risk | Mitigation |
| --- | --- |
| Base UI pre-1.0 API churn | Pin exact version; gate GA on stable release; isolate behind component APIs |
| Visual drift | Reuse exact tokens; visual-parity snapshots as the per-component gate |
| Theme API mismatch (~943 consumers) | Freeze `theme-constants` contract; generated-CSS diff test |
| 1,721 import sites | Preserve subpaths/names; automate with a codemod |
| No Base UI primitive for some components | Build in-house; use Base UI utilities where helpful |
| Bundle regressions | `size-limit` budgets + PR diff; prefer CSS transitions over `framer-motion` |
| `modules/ui` components entangled with app state (Jotai/GraphQL/router) | Triage first; split headless core from app wrapper; controlled props only — no app imports in the library |

## Open questions

1. Published package name: `twenty-new-ui` now, renamed to `twenty-ui` at cut-over (Phase 6).
2. Styling: confirm SCSS Modules vs vanilla-extract vs plain CSS Modules.
3. Variants helper: `clsx` + `data-*` vs `cva`.
4. ~~Visual regression tooling: Chromatic vs self-hosted image snapshots.~~ **Resolved:** Argos (self-hosted at argos.twenty-internal.com). See [Visual regression](#visual-regression).
5. How aggressively to drop `framer-motion` in favor of CSS/Base UI transitions.
6. Scope of `assets` / `testing` / `json-visualizer`: port verbatim or modernize.
7. Where to draw the generic-vs-app-specific line for `modules/ui`, and whether hybrid components live as a headless core in `twenty-new-ui` with a thin app wrapper in `twenty-front`.
