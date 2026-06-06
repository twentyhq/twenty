# Standalone Pages

Use this reference when a Twenty app needs a full-page custom UI: an operational console, map, canvas, planner, status wall, or other page-sized tool.

For general page layout and navigation entities, use `layout.md`. For front component source, runtime imports, hooks, data access, and browser verification, use `front-components.md`. For visual polish and Twenty UI component choices, use `../design/front-component-ui.md`. For CLI and deployment command details, use `../manage-app/cli-and-sync.md`.

This reference owns only the standalone-page assembly pattern and full-page behavior. It repeats small code fragments where they are needed to show how the pieces connect, but leaves general API behavior to the linked references.

## Mental Model

A standalone page is not a raw page body component. In the current local app pattern, custom page content should be rendered through a `FRONT_COMPONENT` widget inside a `STANDALONE_PAGE` page layout. There does not appear to be a separate public "page body component" API for app-defined standalone pages.

The current model is:

1. Define stable universal identifiers.
2. Register the page experience with `defineFrontComponent`.
3. Place that front component in a `definePageLayout` with `type: 'STANDALONE_PAGE'`.
4. Surface the page with `defineNavigationMenuItem` using `NavigationMenuItemType.PAGE_LAYOUT`.
5. Sync or install the app.
6. Twenty resolves the sidebar item to the `/page/:pageLayoutId` route and renders the front component widget inside the page layout.

Use these surfaces for different jobs:

| Surface | Use it for | Primary app entity |
| --- | --- | --- |
| Standalone page | A full workspace page that is not tied to one record | `STANDALONE_PAGE` + `PAGE_LAYOUT` navigation item + `FRONT_COMPONENT` widget |
| Record page layout | Tabs and widgets for one object record | `RECORD_PAGE` page layout or page layout tab |
| Dashboard | Metric and report composition from built-in widgets | `DASHBOARD` page layout |
| Command or side panel | Short actions, focused forms, one selected record, or background commands | `defineFrontComponent` plus command menu item |

## Removing The Scaffolded Placeholder

Every freshly scaffolded app contains three placeholder files that wire a "Welcome" sidebar item to a generic landing page:

- `src/front-components/main-page.tsx`
- `src/page-layouts/main-page.page-layout.ts`
- `src/navigation-menu-items/main-page.navigation-menu-item.ts`

If the app has no user-facing page — for example, it only extends standard objects, declares logic functions, or seeds workflows — delete all three files before the first deploy. Leaving them in ships a dead sidebar item.

## Quickstart

Use this minimal file set:

- `src/constants/universal-identifiers.ts`
- `src/front-components/<name>.front-component.tsx`
- `src/page-layouts/<name>.page-layout.ts`
- `src/navigation-menu-items/<name>.navigation-menu-item.ts`

Start with a tiny component that proves the route works before building the full page.

```ts src/constants/universal-identifiers.ts
export const MISSION_CONTROL_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'a0a1c4f0-f23a-4c59-93c5-92146d64b110';

export const MISSION_CONTROL_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  '63d4970d-6c54-49c8-9c15-52d7cb00fb7a';
```

```tsx src/front-components/mission-control.front-component.tsx
import { defineFrontComponent } from 'twenty-sdk/define';

import {
  MISSION_CONTROL_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from '../constants/universal-identifiers';

const MissionControl = () => {
  return (
    <main
      style={{
        boxSizing: 'border-box',
        display: 'grid',
        minHeight: '100%',
        padding: 24,
        placeItems: 'center',
        width: '100%',
      }}
    >
      <h1 style={{ margin: 0 }}>Mission Control</h1>
    </main>
  );
};

export default defineFrontComponent({
  universalIdentifier: MISSION_CONTROL_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'mission-control',
  description: 'Standalone mission control page.',
  component: MissionControl,
});
```

```ts src/page-layouts/mission-control.page-layout.ts
import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  MISSION_CONTROL_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  MISSION_CONTROL_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
} from '../constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: MISSION_CONTROL_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Mission Control',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: 'e6963ad3-e5fa-41c7-83e1-4fc2ca5de9a8',
      title: 'Mission Control',
      position: 0,
      icon: 'IconRocket',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '18ce05bb-ee3c-4332-80a7-f8fb84f7f70a',
          title: 'Mission Control',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, column: 0, rowSpan: 12, columnSpan: 12 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              MISSION_CONTROL_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
```

```ts src/navigation-menu-items/mission-control.navigation-menu-item.ts
import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  MISSION_CONTROL_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
} from '../constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: '61d44a63-16e8-4fbe-bccb-9c220d44fdb9',
  name: 'Mission Control',
  icon: 'IconRocket',
  color: 'blue',
  position: 50,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier:
    MISSION_CONTROL_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
});
```

Use `PageLayoutTabLayoutMode.CANVAS` for the full-page renderer. Keep the 12 x 12 fill pattern as a grid fallback and editing hint; CANVAS renders the first widget as the page-sized surface.

After the tiny page renders, replace the component body with a full-screen structure:

```tsx
const MissionControl = () => {
  return (
    <main
      style={{
        boxSizing: 'border-box',
        display: 'grid',
        gap: 16,
        gridTemplateRows: 'auto minmax(0, 1fr)',
        height: '100%',
        minHeight: '100%',
        overflow: 'hidden',
        padding: 16,
        width: '100%',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Mission Control</h1>
        <button type="button">Refresh</button>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '280px minmax(0, 1fr)',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <aside style={{ minHeight: 0, overflow: 'auto' }}>Filters</aside>
        <div style={{ minHeight: 0, overflow: 'auto' }}>Workspace data</div>
      </section>
    </main>
  );
};
```

## API Reference

This section only calls out the fields that matter for standalone pages. Use `layout.md` and `front-components.md` for broader entity guidance.

`definePageLayout` owns the standalone route target:

- Use `type: 'STANDALONE_PAGE'`.
- Do not set `objectUniversalIdentifier`; standalone pages are not record scoped.
- Define at least one tab. Use one tab unless the page needs real top-level modes.
- Use `PageLayoutTabLayoutMode.CANVAS`; put the `FRONT_COMPONENT` first and keep a 12 x 12 `gridPosition` as fallback/editing intent.
- Use a `FRONT_COMPONENT` widget with `configurationType: 'FRONT_COMPONENT'` and `frontComponentUniversalIdentifier`.

`defineFrontComponent` owns the actual page experience:

- Register a visible component with `component`, `name`, `description`, and a stable `universalIdentifier`.
- Use `twenty-sdk/front-component` for runtime hooks, host navigation, snackbars, application variables, and side panel actions.
- Use `twenty-client-sdk/core` for workspace records when the page is data driven.
- Use `getPublicAssetUrl` from `twenty-sdk/define` for app-bundled images or static files.

`defineNavigationMenuItem` owns sidebar reachability:

- Use `type: NavigationMenuItemType.PAGE_LAYOUT`.
- Set `pageLayoutUniversalIdentifier` to the standalone page layout universal identifier.
- Set a clear `name`, `icon`, `color`, and `position`.
- Use `folderUniversalIdentifier` only when the page belongs under an existing app folder.

Public assets and non-secret application variables make standalone pages richer without hardcoding environment data:

```tsx
import { defineFrontComponent, getPublicAssetUrl } from 'twenty-sdk/define';
import { getApplicationVariable } from 'twenty-sdk/front-component';

const logoUrl = getPublicAssetUrl('mission-control-logo.png');

const MissionBrand = () => {
  const label = getApplicationVariable('MISSION_LABEL') ?? 'Mission Control';

  return <img src={logoUrl} alt={label} />;
};
```

## Full-Page Layout Guidance

The front component only fills the page if every layer inside the widget has deterministic sizing. Start the root at `height: '100%'`, `minHeight: '100%'`, `width: '100%'`, and `boxSizing: 'border-box'`.

Use `minmax(0, 1fr)` and `minHeight: 0` for scrollable grid or flex children. Without these constraints, inner tables, maps, and canvases can force the page taller than the widget or collapse into a zero-height area.

Prefer one immersive tool surface over a dashboard made of many small cards. If the page is a mission tracker, map, editor, kanban, planner, or cockpit, make the front component own the composition and use internal panels only where they support the workflow.

Assume the available area changes with Twenty chrome, the left sidebar, side panel state, tab list, and smaller screens. Use responsive CSS inside the front component:

- Collapse side filters above or below the main surface on narrow widths.
- Keep map, canvas, table, and timeline containers at `minHeight: 0`.
- Make only intentional regions scroll.
- Keep loading, empty, and error states inside the same sized root so the page never goes blank while data changes.

Avoid hidden overflow traps. `overflow: 'hidden'` is useful for map and canvas roots, but pair it with explicit scroll containers for lists and diagnostics.

## Data And Interactivity

Fetch live workspace records from the front component when the page reflects workspace state:

Use `front-components.md` for general client/runtime rules. In standalone pages, the key additions are visible full-page loading, empty, and error states, plus navigation from the standalone surface back into Twenty records.

```tsx
import { useEffect, useState } from 'react';
import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  enqueueSnackbar,
  navigate,
} from 'twenty-sdk/front-component';

type CompanySummary = Pick<CoreSchema.Company, 'id' | 'name'>;

const CompaniesStandalonePage = () => {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCompanies = async () => {
      try {
        setLoading(true);
        setError(null);

        const client = new CoreApiClient();
        const result = await client.query({
          companies: {
            edges: {
              node: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (!cancelled) {
          setCompanies(result.companies.edges.map((edge) => edge.node));
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load companies';

        if (!cancelled) {
          setError(message);
          enqueueSnackbar({ message, variant: 'error' });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCompanies();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading companies...</div>;
  if (error) return <div style={{ padding: 24 }}>{error}</div>;
  if (companies.length === 0) {
    return <div style={{ padding: 24 }}>No companies yet.</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 8, padding: 24 }}>
      {companies.map((company) => (
        <button
          key={company.id}
          type="button"
          onClick={() =>
            navigate(AppPath.RecordShowPage, {
              objectNameSingular: 'company',
              objectRecordId: company.id,
            })
          }
        >
          {company.name}
        </button>
      ))}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: '5aa8c51f-72a4-4929-a6ab-2d4ea9d2a6df',
  name: 'companies-standalone-page',
  description: 'Lists companies and opens related records.',
  component: CompaniesStandalonePage,
});
```

Always model these states:

- Loading: show progress in the same page shell that the loaded view uses.
- Empty: explain what is missing and offer the next action if one exists.
- Error: show the message and keep a retry path visible.
- Auth refresh: token failures can happen during development or long-lived sessions; surface the failure instead of returning `null`.
- Demo data: label fake data clearly and keep the switch to live data obvious.

Use `navigate` for full-page routes and `openSidePanelPage` for focused side-panel workflows. Prefer navigating to the record route when the user is leaving the standalone experience to inspect a real record.

## Debugging

For a black screen, check the simplest causes first:

- Component runtime exception: open the browser console and look for a front component error, React error, or Remote DOM unsupported operation.
- Missing data fallback: temporarily replace the component with the tiny "Mission Control" component from this reference.
- Token or fetch failure: log the caught error, confirm `CoreApiClient` generation, and show an error state.
- Public asset failure: verify `getPublicAssetUrl(...)` output in the network tab and render without the asset.
- CSS layer covering content: remove absolute overlays, `zIndex`, and full-screen backgrounds until text is visible.
- Zero-height container: add visible borders and confirm `height: '100%'`, `minHeight: '100%'`, `minHeight: 0`, and the 12 x 12 widget grid position.
- Unsupported browser or Remote DOM behavior: remove unusual DOM APIs, portals, global document access, and third-party components until the minimal UI renders.
- Stale deployed app version: confirm the installed app version is the one you just synced or deployed.

Console checks:

```tsx
console.info('Standalone page mounted');
console.info('Companies loaded', companies.length);
```

Installed-app checks:

- Confirm the app appears in Twenty settings or the application developer view.
- Confirm the sidebar item appears with the expected icon and label.
- Confirm clicking the sidebar item opens `/page/:pageLayoutId`.
- Confirm the page still renders after a hard refresh.

Known-good component test:

```tsx
const KnownGoodStandalonePage = () => (
  <main style={{ minHeight: '100%', padding: 24 }}>
    <h1>Standalone page runtime is working</h1>
  </main>
);
```

If this renders but the full page does not, the issue is inside the full component. If this does not render, inspect the layout, navigation, sync, installation, and front component registration.

## Deployment And Verification

Use local dev sync while iterating and one-shot sync for bounded verification. Use `../manage-app/cli-and-sync.md` for exact command behavior, remote setup, verbose troubleshooting, deploys, and logs.

```bash
yarn twenty dev --once
```

Install and update flow:

- During development, sync against the active remote and confirm the app appears as installed in the target workspace.
- For an already installed app, sync or deploy the updated version, then reopen the sidebar route and hard refresh the page.
- For packaged deploys, bump `package.json` before publishing an update to a workspace that already has the app installed.

Versioning expectations:

- Dev sync updates the active remote during development.
- Deploying a packaged update requires a strictly higher `package.json` version than the installed version.
- Users may need to update or reinstall the app depending on how the target workspace receives application updates.

Acceptance checks:

- Sidebar item appears in the expected section or folder.
- Sidebar item opens the standalone page route.
- The front component renders visible content.
- The component fills the widget/page area at desktop size.
- Data loads from live workspace records or a clearly labeled demo source.
- Loading, empty, and error fallbacks are visible and nonblank.
- Record navigation or side panel interactions work.
- Desktop and smaller-screen screenshots are nonblank and do not show overlapping controls.

## Examples

Minimal standalone page:

- One front component.
- One `STANDALONE_PAGE` page layout.
- One `PAGE_LAYOUT` navigation item.
- One 12 x 12 `FRONT_COMPONENT` widget.

Full-screen operational page:

- Root grid with header and `minmax(0, 1fr)` body.
- Left filter panel, central work surface, optional right inspector.
- Loading, empty, error, and retry UI inside the same shell.

Data-driven page that opens related records:

- Fetch records with `CoreApiClient`.
- Render a list, table, timeline, or map.
- Use `navigate(AppPath.RecordShowPage, { objectNameSingular, objectRecordId })` for record drill-in.

Immersive canvas or map-style page, such as a Space X Mission Tracking page:

- Keep the map/canvas as the main full-height surface.
- Put filters, mission status, and selected mission details in internal panels.
- Use public assets for mission patches or map overlays.
- Avoid composing the page as dashboard cards unless the user is primarily comparing metrics.
