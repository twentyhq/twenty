---
name: deploy-twenty-app
description: >
  Build and deploy a custom Twenty app (front component + page layout) to UAT or
  production. Use this skill when the user wants to add a bespoke UI panel to a
  Twenty record page — e.g. a custom tab showing related data in a non-standard
  layout that the standard relation chips can't express.
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# deploy-twenty-app

Build and deploy a standalone Twenty app to a workspace.

## When to use this

Use a Twenty app when you need:
- A **custom tab** on a record page (e.g. a Quote Sections panel with nested cards)
- A **front component** that queries and renders data in a way the standard UI can't
- A **page layout** that reorganises the default field/relation tabs

The standard Twenty UI is suitable for flat CRUD. A custom app is warranted when you
need nested tables, computed views, or bespoke interaction patterns.

## App location

```
apps/stratum-quote-app/          ← our only app so far
  package.json
  src/
    application-config.ts
    default-role.ts
    constants/universal-identifiers.ts   ← all UUIDs live here
    components/                          ← front components (.tsx)
    layouts/                             ← page layouts (.ts)
```

## Prerequisites

Node 24 is required. The system node is older; use nvm:

```bash
export PATH='/home/clive/.nvm/versions/node/v24.14.0/bin:$PATH'
```

Prefix every `yarn twenty` command with this export, or use the wrapper:

```bash
bash -c "export PATH='/home/clive/.nvm/versions/node/v24.14.0/bin:\$PATH' && cd apps/stratum-quote-app && yarn twenty <command> --remote uat"
```

The remote auth is stored in `~/.twenty/config.json` (API key for UAT, set earlier).
Run `yarn twenty remote status` to verify it's still valid.

---

## UUID requirement — CRITICAL

**All `universalIdentifier` values must be valid UUID v4.**

UUID v4 format: `xxxxxxxx-xxxx-4xxx-[89ab]xxx-xxxxxxxxxxxx`
- Third segment must start with `4` (e.g. `4df3`, `4507`)
- Fourth segment must start with `8`, `9`, `a`, or `b`

Generate with:
```bash
python3 -c "import uuid; print('\n'.join(str(uuid.uuid4()) for _ in range(6)))"
```

**Do not use hand-crafted sequential UUIDs** like `a1b2c3d4-e5f6-7890-abcd-ef1234567890` —
they fail the server's validation and the install silently creates the `application` row
but skips all metadata (page layouts, front components, tabs, widgets).

---

## Build and deploy workflow

### 1. Write the front component

`src/components/<name>.tsx`:

```tsx
import { useCallback, useEffect, useState } from 'react';
import { defineFrontComponent, useRecordId } from 'twenty-sdk';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';
import { MY_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const MyComponent = () => {
  const recordId = useRecordId();   // current record's UUID
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!isDefined(recordId)) return;
    const client = new CoreApiClient();
    client.query({
      myObjects: {
        __args: { filter: { parentId: { eq: recordId } } },
        edges: { node: { id: true, name: true } },
      },
    }).then(r => setData(r?.myObjects?.edges?.map(e => e.node) ?? []));
  }, [recordId]);

  return <div>{/* render */}</div>;
};

export default defineFrontComponent({
  universalIdentifier: MY_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'my-component',
  description: 'What it does',
  component: MyComponent,
});
```

Key points:
- Import hooks from `twenty-sdk`, client from `twenty-client-sdk/core`
- `useRecordId()` returns the current record's ID (string | null)
- `CoreApiClient.query()` uses a GraphQL-like object syntax with `__args`
- Plural queries return `{ edges: [{ node: {...} }] }`; singular queries return the object directly
- Use **inline styles** — no Linaria/CSS-in-JS available in the app sandbox
- If the component needs to scroll, it must live in a **CANVAS** tab (see layout below)

### Querying custom objects (not defined in the app manifest)

`CoreApiClient` only knows about objects declared in the app's own manifest
(`defineObject`). For independently-created custom objects (e.g. `quoteSection`),
it throws `"Error: type 'Query' does not have a field 'quoteSections'"`.

Use raw `fetch` instead:

```tsx
const baseUrl = process.env.TWENTY_API_URL ?? '';
// IMPORTANT: TWENTY_API_URL is the server base URL (e.g. https://twenty-uat-0a4c.up.railway.app)
// WITHOUT the /graphql suffix — always append it explicitly:
const apiUrl = baseUrl.endsWith('/graphql') ? baseUrl : `${baseUrl}/graphql`;
const token = process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

const response = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token ?? ''}`,
  },
  body: JSON.stringify({ query: `...`, variables: { ... } }),
});
const json = await response.json();
if (json.errors?.length) throw new Error(json.errors[0].message);
```

Both `TWENTY_API_URL` and `TWENTY_APP_ACCESS_TOKEN` are injected by the SDK
renderer at runtime via `setWorkerEnv` — they are NOT baked in at build time.

**Filtering custom objects:** use the FK column directly, not the relation field name:
```graphql
# WRONG — throws "Cannot filter by relation field"
filter: { quote: { id: { eq: $quoteId } } }

# CORRECT
filter: { quoteId: { eq: $quoteId } }
```

### 2. Write the page layout

`src/layouts/<name>.ts`:

```typescript
import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk';
import {
  MY_OBJECT_UNIVERSAL_IDENTIFIER,
  MY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  MY_TAB_UNIVERSAL_IDENTIFIER,
  MY_WIDGET_UNIVERSAL_IDENTIFIER,
  MY_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: MY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'My Object Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: MY_OBJECT_UNIVERSAL_IDENTIFIER,   // from objectMetadata.universalIdentifier
  tabs: [
    {
      universalIdentifier: MY_TAB_UNIVERSAL_IDENTIFIER,
      title: 'My Tab',
      position: 50,          // 0 = first tab; increment by 50 for each additional
      icon: 'IconLayoutList',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,   // use CANVAS if the component scrolls
      widgets: [
        {
          universalIdentifier: MY_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'My Widget',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier: MY_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
```

`PageLayoutTabLayoutMode` values: `CANVAS`, `VERTICAL_LIST`, `GRID`

### 3. Register UUIDs

Add all new UUIDs to `src/constants/universal-identifiers.ts`. Use valid v4 UUIDs only.

### 4. Deploy the tarball

```bash
bash -c "export PATH='/home/clive/.nvm/versions/node/v24.14.0/bin:\$PATH' && \
  cd /home/clive/_Projects/stratum/twenty/source/apps/stratum-quote-app && \
  yarn twenty deploy --remote uat"
```

Expected output ends with `✓ Deployed successfully`.

The deploy command:
- Builds and type-checks the app
- Packs a tarball
- Uploads it to the UAT server (creates/updates `applicationRegistration`)
- Does NOT install the app — that is a separate step

### 5. Install (first time only)

The app does not self-install. A workspace admin must install it via the UI:

1. Open UAT → **Settings → Applications**
2. Look under **"Your Apps"** (may require a hard-refresh)
3. Click the app → **"Install on this workspace"**

`yarn twenty install --remote uat` requires OAuth auth and currently returns Forbidden
when using an API key token — use the UI instead.

### 6. Flush metadata cache

```bash
railway ssh --service twenty --environment uat -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flat-cache-invalidate --all-metadata"
```

This invalidates `flatPageLayoutMaps`, `flatPageLayoutWidgetMaps`, `flatPageLayoutTabMaps`,
`flatFrontComponentMaps`, and all other flat entity maps for the workspace. **This must be
run any time you make direct SQL changes to page layout tables.** The server reads layouts
from a Redis-backed flat cache — without this step, the new widget/tab is invisible to the
frontend even though it's in the database.

Then hard-refresh the browser.

### 7. Updating an already-installed app

After deploying a new version:
- If the app was previously installed with valid UUIDs, the server may auto-sync.
- If the install previously failed (e.g. invalid UUIDs), uninstall first via the UI
  (Settings → Applications → Stratum Quote UI → Uninstall), then reinstall (step 5).
- Always flush cache after reinstalling.

---

## Critical: the "Default Layout always wins" problem

When you define a `definePageLayout` in the app targeting a pre-existing object (e.g. Quote),
**the server creates a separate layout ("Quote Record Page") that is never shown**. The
workspace's "Default Quote Layout" always wins for pre-existing objects.

### Symptom

The app installs successfully, but the new tab never appears in the record detail page.
The "Quote Record Page" layout exists in the DB but is ignored.

### Solution: idempotent SQL layout migration

To wire your front component into the workspace's active layout, write an idempotent SQL
migration (see `scripts/layout-migrations/`) that:

1. Looks up the current `frontComponent` id by its stable `universalIdentifier`
2. Deletes any existing FRONT_COMPONENT widget in the target tab
3. Inserts a fresh widget pointing to the current frontComponent id

**Critical details:**
- Use the **workspace's custom application id** (not the app's application id) for the widget's
  `applicationId`. The app's own id is deleted on uninstall, which would cascade-delete the
  widget. The workspace's custom app survives reinstalls.
- The `frontComponent` DB id **changes on every app reinstall**. Re-run the SQL migration
  after every reinstall to keep the widget pointing to the current id.
- After running the SQL, always flush the flat entity cache (step 6 above) — otherwise the
  server serves the stale cached layout and the tab stays hidden.

### After each reinstall cycle

Run migration, then flush cache:

```bash
# 1. Run the layout migration
B64=$(base64 -w0 /path/to/scripts/layout-migrations/NNN-your-component.sql)
railway ssh --service twenty --environment uat -- \
  "printf '%s' '$B64' | base64 -d > /tmp/m.sql && psql \"\$PG_DATABASE_URL\" -f /tmp/m.sql"

# 2. Flush flat entity cache
railway ssh --service twenty --environment uat -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flat-cache-invalidate --all-metadata"
```

Then hard-refresh the browser. The tab should appear.

### Finding the tab and applicationId to use

```sql
-- Find the Default Layout for an object and its tabs
SELECT l.id as layout_id, l.name, t.id as tab_id, t.title, t.position, t."applicationId"
FROM core."pageLayout" l
JOIN core."pageLayoutTab" t ON t."pageLayoutId" = l.id
WHERE l.name LIKE 'Default%Quote%'
ORDER BY t.position;

-- Find the workspace's custom application id
SELECT id, name FROM core.application
WHERE name NOT IN ('Twenty Standard')
  AND "universalIdentifier" NOT IN ('20202020-64aa-4b6f-b003-9c74b97cee20')
ORDER BY "createdAt";
```

---

## Verifying the install succeeded

Check the database — all three rows must exist:

```bash
# pageLayout should have a row for the app
railway ssh --service twenty --environment uat -- \
  'psql "$PG_DATABASE_URL" -c "SELECT name, \"universalIdentifier\" FROM core.\"pageLayout\" WHERE \"applicationId\" = (SELECT id FROM core.application WHERE \"universalIdentifier\" = '"'"'<APP_UUID>'"'"');"'
```

Or via the Postgres MCP:
```sql
SELECT id, name FROM core."pageLayout"
WHERE "applicationId" = (SELECT id FROM core."application" WHERE "universalIdentifier" = '<APP_UUID>');
```

If empty, the install failed silently — check Railway logs for `WorkspaceMigrationBuilderException`.

---

## Object universalIdentifier lookup

Page layouts reference objects by `universalIdentifier` (not the internal `id`).
Look up the correct value:

```sql
SELECT "nameSingular", "universalIdentifier"
FROM core."objectMetadata"
WHERE "nameSingular" IN ('quote', 'quoteSection', 'quoteTerm', 'lineItem');
```

Our objects:
| Object | universalIdentifier |
|---|---|
| quote | `666ccad4-bcca-496d-8b61-fd9819f2ae11` |
| quoteSection | `d6f51d4e-71e1-4991-b99f-69921c79dc75` |
| quoteTerm | `d6c43073-0cac-43ea-b7ae-5eb20b2080eb` |
| lineItem | `fcdc6542-03bd-4260-bdad-63efc19da9db` |

---

## Current apps

| App | Path | Deployed to |
|---|---|---|
| Stratum Quote UI | `apps/stratum-quote-app/` | UAT (installed) |

App UUID: `18f1e1cb-9111-4ec9-aa49-319de75d2514`
