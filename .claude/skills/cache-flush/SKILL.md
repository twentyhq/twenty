---
name: cache-flush
description: >
  Flush the Twenty flat entity cache on UAT, production, or the current
  environment. Invalidates all metadata caches (page layouts, field metadata,
  front components, navigation items, etc.) so the server re-reads from the DB.
  Required after any direct SQL changes to core.* tables (page layout, widgets,
  tabs) and after app reinstalls.
user-invocable: true
allowed-tools: Bash
---

# cache-flush

Flush the Twenty flat entity cache on one or more Railway environments.

## When to use

Run this after any of the following:
- Direct SQL changes to `core."pageLayout*"` or `core."frontComponent"` tables
- Installing or reinstalling a Twenty app
- Running a layout migration script (`scripts/layout-migrations/`)
- Any metadata change that isn't reflected in the UI after a hard-refresh

## Usage

```
/cache-flush          # flush current environment (defaults to UAT)
/cache-flush uat      # flush UAT explicitly
/cache-flush prod     # flush production
/cache-flush uat prod # flush both
```

## What this flushes

The command invalidates all flat entity maps for the workspace, including:
`flatPageLayoutMaps`, `flatPageLayoutWidgetMaps`, `flatPageLayoutTabMaps`,
`flatFrontComponentMaps`, `flatFieldMetadataMaps`, `flatObjectMetadataMaps`,
`flatNavigationMenuItemMaps`, and all others.

After flushing, the next GraphQL request from the frontend triggers a full
cache recompute from the database.

## Steps

Parse the arguments to determine which environments to flush. If none
provided, default to UAT.

For **UAT**:
```bash
railway ssh --service twenty --environment uat -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flat-cache-invalidate --all-metadata"
```

For **production**:
```bash
railway ssh --service twenty --environment production -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flat-cache-invalidate --all-metadata"
```

Confirm success by checking the last line of output:
`[FlatCacheInvalidateCommand] Command completed!`

Then tell the user to hard-refresh their browser tab.

## Notes

- This flushes **metadata caches only** (Redis-backed flat entity maps). It
  does NOT affect workspace data (CRM records, contacts, etc.) — those are
  read directly from Postgres and are not cached.
- This is different from `cache:flush` (which flushes Apollo/application
  cache) — both may be needed in some scenarios.
- After flushing, always hard-refresh the browser to clear the Apollo cache.
