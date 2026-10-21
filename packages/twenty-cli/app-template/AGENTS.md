## Base documentation

- Getting started:
  - https://docs.twenty.com/developers/extend/apps/getting-started/quick-start.md
  - https://docs.twenty.com/developers/extend/apps/getting-started/concepts.md
  - https://docs.twenty.com/developers/extend/apps/getting-started/project-structure.md
  - https://docs.twenty.com/developers/extend/apps/getting-started/local-server.md
  - https://docs.twenty.com/developers/extend/apps/getting-started/scaffolding.md
  - https://docs.twenty.com/developers/extend/apps/getting-started/troubleshooting.md
- Config:
  - https://docs.twenty.com/developers/extend/apps/config/overview.md
  - https://docs.twenty.com/developers/extend/apps/config/application.md
  - https://docs.twenty.com/developers/extend/apps/config/roles.md
  - https://docs.twenty.com/developers/extend/apps/config/install-hooks.md
  - https://docs.twenty.com/developers/extend/apps/config/public-assets.md
- Data:
  - https://docs.twenty.com/developers/extend/apps/data/overview.md
  - https://docs.twenty.com/developers/extend/apps/data/objects.md
  - https://docs.twenty.com/developers/extend/apps/data/extending-objects.md
  - https://docs.twenty.com/developers/extend/apps/data/relations.md
- Logic:
  - https://docs.twenty.com/developers/extend/apps/logic/overview.md
  - https://docs.twenty.com/developers/extend/apps/logic/logic-functions.md
  - https://docs.twenty.com/developers/extend/apps/logic/skills-and-agents.md
  - https://docs.twenty.com/developers/extend/apps/logic/connections.md
- Layout:
  - https://docs.twenty.com/developers/extend/apps/layout/overview.md
  - https://docs.twenty.com/developers/extend/apps/layout/views.md
  - https://docs.twenty.com/developers/extend/apps/layout/navigation-menu-items.md
  - https://docs.twenty.com/developers/extend/apps/layout/page-layouts.md
  - https://docs.twenty.com/developers/extend/apps/layout/front-components.md
  - https://docs.twenty.com/developers/extend/apps/layout/command-menu-items.md
- Operations:
  - https://docs.twenty.com/developers/extend/apps/operations/overview.md
  - https://docs.twenty.com/developers/extend/apps/operations/cli.md
  - https://docs.twenty.com/developers/extend/apps/operations/testing.md
  - https://docs.twenty.com/developers/extend/apps/operations/publishing.md
- Rich app example: https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/examples/postcard

## Front components

For front component work, follow the official `develop-app` skill when installed. Install the official skills with `npx skills add https://github.com/twentyhq/twenty/tree/agent-skills --skill '*'`. Apply these essentials even when no skills are installed:

- For every visible front component, use `twenty-ui` components by default. Reuse an equivalent Twenty UI control before writing a custom control or adding another UI library. Plain HTML is appropriate for layout containers and content without a Twenty UI equivalent.
- Import from public family subpaths: `twenty-ui/components/input` for `MainButton` and `LightButton`, `twenty-ui/primitives/input` for foundational controls, `twenty-ui/primitives/typography` for text, and the matching family for other components. Import individual icons from `twenty-ui/icon`, never `IconsProvider` or `useIcons`. Keep `twenty-ui`, `twenty-sdk` and `twenty-client-sdk` pinned to the same version in `devDependencies`.
- The renderer supplies styles and the workspace theme. Use `useTheme()` from `twenty-ui/theme` inside the component for spacing, colors, typography and radii. Do not add a root `ThemeProvider`, force a color scheme, or copy standalone stylesheet setup into a front component. Never dereference theme tokens at module top level, since entity files also run during manifest extraction.
- Use component props before custom styles. Keep layouts compact and responsive to widget width, give inputs visible labels and icon-only actions accessible names, and handle loading, empty, error, disabled and saving states. Verify light and dark themes, narrow widths and long values.
- Use `openCommandConfirmationModal` or `CommandModal` from `twenty-sdk/front-component` for confirmation dialogs and `enqueueSnackbar` for notifications. Do not render `Dialog`, `AlertDialog`, native `dialog` elements or native browser popovers directly. Use Twenty UI `Dropdown` for menus and pickers.
- Components run in a Web Worker with a sandboxed, partial `window` and `document`. Prefer CSS for layout and width-based queries. `canvas` and `scrollIntoView` are unsupported; consult the current runtime limitations before using other browser APIs.
- Keep the `.tsx` entity's direct `export default defineFrontComponent({ ... })` call. The SDK mounts the component, so do not call `react-dom/client` or use browser globals at module top level.
- Read workspace data with `CoreApiClient` from `twenty-client-sdk/core` and selection with `useSelectedRecordIds()` from `twenty-sdk/front-component`. Call third-party APIs from logic functions; secret application variables never reach a front component.

Read the [front component guide](https://docs.twenty.com/developers/extend/apps/layout/front-components.md) before implementation for the renderer setup and runtime limitations. Use [Twenty UI getting started](https://docs.twenty.com/ui/getting-started.md), [components](https://docs.twenty.com/ui/components/overview.md), [primitives](https://docs.twenty.com/ui/primitives/overview.md) and [theming](https://docs.twenty.com/ui/theming.md) to find the relevant component page and check its current props and composition.

## UUID requirement

- All generated UUIDs must be valid UUID v4.

## Common Pitfalls

- Creating a view without a navigationMenuItem associated. This will make the view available on the left sidebar.
- Creating a front component that overflows its widget. Fit the available width and let content determine height, unless the component is the tab's single `heightBehavior: 'TAB_VIEWPORT'` widget and owns internal scrolling.

## Best practice

It's highly recommended to create new app entities using `yarn twenty dev:add`. These are the options:

| Entity type          | Command                                  | Generated file                        |
| -------------------- | ---------------------------------------- | ------------------------------------- |
| Object               | `yarn twenty dev:add object`             | `src/objects/<name>.ts`               |
| Field                | `yarn twenty dev:add field`              | `src/fields/<name>.ts`                |
| Logic function       | `yarn twenty dev:add logicFunction`      | `src/logic-functions/<name>.ts`       |
| Front component      | `yarn twenty dev:add frontComponent`     | `src/front-components/<name>.tsx`     |
| Role                 | `yarn twenty dev:add role`               | `src/roles/<name>.ts`                 |
| Skill                | `yarn twenty dev:add skill`              | `src/skills/<name>.ts`                |
| Agent                | `yarn twenty dev:add agent`              | `src/agents/<name>.ts`                |
| View                 | `yarn twenty dev:add view`               | `src/views/<name>.ts`                 |
| Navigation menu item | `yarn twenty dev:add navigationMenuItem` | `src/navigation-menu-items/<name>.ts` |
| Page layout          | `yarn twenty dev:add pageLayout`         | `src/page-layouts/<name>.ts`          |
| Page layout tab      | `yarn twenty dev:add pageLayoutTab`      | `src/page-layout-tabs/<name>.ts`      |
| Command menu item    | `yarn twenty dev:add commandMenuItem`    | `src/command-menu-items/<name>.ts`    |
| View field           | `yarn twenty dev:add viewField`          | `src/view-fields/<name>.ts`           |
| Connection provider  | `yarn twenty dev:add connectionProvider` | `src/connection-providers/<name>.ts`  |

This helps automatically generate required IDs etc.
