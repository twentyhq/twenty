---
name: manage-record-layout
description: >
  Read, create, and update the detail view layout for any Twenty CRM object —
  groups, fields, tabs, and individual field cards. Use this whenever the user
  wants to add, remove, reorder, or reorganise fields on a record detail page,
  or inspect why a field is missing or duplicated.
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# manage-record-layout

Configure the record detail page layout for any Twenty CRM object. Covers
reading the current state, adding fields to groups, creating new groups, and
managing individual field card widgets.

## Schema overview

Twenty's record detail page is driven by four layers of database rows:

```
core.pageLayout          (one per object)
  └── core.pageLayoutTab         (tabs: Home, Timeline, Tasks …)
        └── core.pageLayoutWidget      (widgets on each tab)
              ├── type=FIELDS  →  references a core.view (type=FIELDS_WIDGET)
              │     └── core.viewFieldGroup     (collapsible sections)
              │           └── core.viewField    (individual fields in a section)
              └── type=FIELD   →  single field shown as a prominent card
```

### Widget types

| `type`      | What it renders |
|-------------|-----------------|
| `FIELDS`    | Grouped/inline list of fields — references a `FIELDS_WIDGET` view |
| `FIELD`     | Single relation field shown as a card (e.g. Company card) |
| `TIMELINE`  | Activity feed |
| `TASKS`     | Linked tasks |
| `NOTES`     | Linked notes |
| `FILES`     | Attachments |
| `EMAILS`    | Email thread |
| `CALENDAR`  | Calendar events |

### FIELDS widget display modes

- **Grouped** — view has `viewFieldGroup` rows → shows collapsible sections with headers
- **Inline** — view has `viewField` rows but NO `viewFieldGroup` rows → flat list

Groups take priority. If a view has both, only groups are rendered.

**Critical**: `viewField` rows with `viewFieldGroupId = NULL` are IGNORED when
the view uses groups. Every field must be assigned to a group.

---

## Step 1 — Find the page layout for an object

```sql
SELECT pl.id AS layout_id, om."nameSingular"
FROM core."pageLayout" pl
JOIN core."objectMetadata" om ON om.id = pl."objectMetadataId"
WHERE om."nameSingular" = 'opportunity';  -- change object name here
```

## Step 2 — Inspect the Home tab widgets

```sql
SELECT plt.title AS tab, pw.id AS widget_id, pw.type,
       pw.configuration::text, (pw.position->>'index')::int AS idx
FROM core."pageLayoutTab" plt
JOIN core."pageLayoutWidget" pw ON pw."pageLayoutTabId" = plt.id
WHERE plt."pageLayoutId" = '<layout_id>'
ORDER BY plt.position, (pw.position->>'index')::int;
```

Key configuration fields:
- `FIELDS` widget: `{"viewId": "<uuid>", "configurationType": "FIELDS", "newFieldDefaultVisibility": true}`
- `FIELD` widget: `{"fieldMetadataId": "<uuid>", "fieldDisplayMode": "CARD", "configurationType": "FIELD"}`

## Step 3 — Inspect the FIELDS widget groups and fields

Get the `viewId` from the FIELDS widget configuration, then:

```sql
SELECT vfg.id AS group_id, vfg.name AS group_name, vfg.position AS grp_pos,
       vf.id AS vf_id, vf."fieldMetadataId", vf."isVisible", vf.position AS vf_pos,
       fm.name AS field_name, fm.label, fm."isCustom"
FROM core."viewFieldGroup" vfg
LEFT JOIN core."viewField" vf ON vf."viewFieldGroupId" = vfg.id
                              AND vf."deletedAt" IS NULL
LEFT JOIN core."fieldMetadata" fm ON fm.id = vf."fieldMetadataId"
WHERE vfg."viewId" = '<fields_widget_view_id>'
ORDER BY vfg.position, vf.position;
```

## Step 4 — Find active fields not yet in any group

```sql
SELECT fm.id, fm.name, fm.label, fm.type, fm."isCustom"
FROM core."fieldMetadata" fm
WHERE fm."objectMetadataId" = '<object_metadata_id>'
  AND fm."isActive" = true
  AND fm.id NOT IN (
    SELECT vf."fieldMetadataId"
    FROM core."viewField" vf
    JOIN core."viewFieldGroup" vfg ON vfg.id = vf."viewFieldGroupId"
    WHERE vfg."viewId" = '<fields_widget_view_id>'
      AND vf."deletedAt" IS NULL
  )
ORDER BY fm.name;
```

## Step 5 — Get required IDs for inserts

```sql
-- workspace and application IDs (needed for all inserts)
SELECT id AS workspace_id FROM core.workspace LIMIT 1;
SELECT id AS application_id FROM core.application
WHERE "workspaceId" = '<workspace_id>' LIMIT 1;
```

---

## Adding fields to an existing group

Replace `<group_id>`, `<view_id>`, `<field_metadata_id>`, workspace/app IDs,
and `<position>` (integer, higher = lower in the list):

```sql
INSERT INTO core."viewField"
  ("universalIdentifier","id","fieldMetadataId","isVisible","size","position",
   "viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
VALUES
  (gen_random_uuid(), gen_random_uuid(),
   '<field_metadata_id>', true, 0, <position>,
   '<view_id>', '<group_id>',
   '<workspace_id>', '<application_id>',
   now(), now());
```

To add multiple fields at once, add more `(...)` rows separated by commas.

**Do not** set `viewFieldGroupId = NULL` — orphaned rows are silently ignored
when the view uses groups.

---

## Creating a new group

```sql
INSERT INTO core."viewFieldGroup"
  ("universalIdentifier","id","name","position","isVisible",
   "viewId","workspaceId","applicationId","createdAt","updatedAt")
VALUES
  (gen_random_uuid(), gen_random_uuid(),
   'My Group Name', <position>,  -- 0=first, 1=second, etc.
   true,
   '<view_id>', '<workspace_id>', '<application_id>',
   now(), now())
RETURNING id;  -- capture the new group_id for subsequent inserts
```

Group names cannot contain `&` when passed through shell heredocs — use "and"
instead, or use individual `psql -c` calls.

---

## Removing a field from a group (hide it)

Soft-delete by setting `deletedAt`:

```sql
UPDATE core."viewField"
SET "deletedAt" = now()
WHERE "viewFieldGroupId" = '<group_id>'
  AND "fieldMetadataId" = '<field_metadata_id>';
```

Or hard-delete if you're sure it won't be needed:

```sql
DELETE FROM core."viewField"
WHERE "viewFieldGroupId" = '<group_id>'
  AND "fieldMetadataId" = '<field_metadata_id>';
```

---

## Removing an individual FIELD card widget

```sql
DELETE FROM core."pageLayoutWidget"
WHERE id = '<widget_id>';
```

---

## Reordering fields within a group

```sql
UPDATE core."viewField" SET position = <new_position>
WHERE id = '<viewfield_id>';
```

Position is `double precision` — you can use fractional values (e.g. `0.5`)
to insert between existing items without renumbering everything.

---

## Moving a group up or down

```sql
UPDATE core."viewFieldGroup" SET position = <new_position>
WHERE id = '<group_id>';
```

---

## Shell execution tips

All commands run via `railway ssh`:

```bash
railway ssh --environment uat --service twenty -- \
  'PAGER=cat psql "$PG_DATABASE_URL" -c "YOUR SQL HERE;"'
```

**UUID quoting**: UUIDs must be single-quoted in SQL. Inside a shell string that
already uses single quotes, escape each `'` as `'"'"'`:

```bash
railway ssh --environment uat --service twenty -- \
  'psql "$PG_DATABASE_URL" -c "SELECT id FROM core.\"viewFieldGroup\" WHERE id = '"'"'aaaaaaaa-0001-4000-8000-000000000001'"'"';"'
```

**For complex multi-statement SQL** (multiple INSERTs, transactions), write the
SQL to a local file, base64-encode it, and decode on the server:

```bash
# 1. Write SQL to local file (no shell quoting issues)
cat > /tmp/my_migration.sql << 'EOF'
BEGIN;
INSERT INTO core."viewField" ...;
COMMIT;
EOF

# 2. Pipe via base64
base64 /tmp/my_migration.sql | \
  railway ssh --environment uat --service twenty -- \
    'base64 -d > /tmp/remote.sql && psql "$PG_DATABASE_URL" -f /tmp/remote.sql'
```

---

## After any layout change — flush the cache

```bash
railway ssh --environment uat --service twenty -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flush"
```

Then hard-refresh the browser (Ctrl+Shift+R). Changes to viewField/viewFieldGroup
rows are not reflected until the flat entity cache is cleared.

---

## Finding fields NOT in any group (quick audit query)

Use this before starting a layout fix to see exactly what's missing:

```sql
SELECT fm.id, fm.name, fm.label, fm.type, fm."isCustom", fm."isActive"
FROM core."fieldMetadata" fm
WHERE fm."objectMetadataId" = '<object_metadata_id>'
  AND fm."isActive" = true
  -- exclude system/internal fields that should never appear in the layout
  AND fm.name NOT IN (
    'id','position','searchVector','deletedAt','favorites',
    'attachments','noteTargets','taskTargets','timelineActivities',
    'updatedAt','updatedBy'
  )
  AND fm.id NOT IN (
    SELECT vf."fieldMetadataId"
    FROM core."viewField" vf
    JOIN core."viewFieldGroup" vfg ON vfg.id = vf."viewFieldGroupId"
    WHERE vfg."viewId" = '<fields_widget_view_id>'
      AND vf."deletedAt" IS NULL
  )
ORDER BY fm."isCustom", fm.name;
```

Also check for inactive fields currently shown (to remove them):

```sql
SELECT vf.id AS vf_id, vfg.name AS group_name, fm.name, fm.label, fm."isActive"
FROM core."viewField" vf
JOIN core."viewFieldGroup" vfg ON vfg.id = vf."viewFieldGroupId"
JOIN core."fieldMetadata" fm ON fm.id = vf."fieldMetadataId"
WHERE vfg."viewId" = '<fields_widget_view_id>'
  AND vf."deletedAt" IS NULL
  AND fm."isActive" = false;
```

---

## Migrating layout changes to production

Layout state lives in workspace data tables — not in code or TypeORM migrations.
When `backfill-page-layouts` runs on production for the first time it creates bare
default layouts (FIELD cards + sparse FIELDS widget groups). All customisations
made on UAT (extra groups, custom fields in groups, FIELD card removals) must be
replayed on production via idempotent SQL.

**Critical rule: never hardcode UAT UUIDs in a migration script.** Every UUID
(`objectMetadataId`, `fieldMetadataId`, `viewId`, `viewFieldGroupId`) differs
between environments. Always resolve them dynamically by joining on stable names.

### Pattern — idempotent layout migration using PL/pgSQL

Write the SQL to a local file and execute it via base64 pipe (see Shell execution
tips). Use a PL/pgSQL `DO` block so all IDs are resolved at runtime:

```sql
DO $$
DECLARE
  v_workspace_id UUID;
  v_app_id       UUID;
  v_obj_id       UUID;
  v_view_id      UUID;
  v_group_id     UUID;
  v_field_id     UUID;
BEGIN
  -- Resolve workspace / application (same on every environment)
  SELECT id INTO v_workspace_id FROM core.workspace LIMIT 1;
  SELECT id INTO v_app_id FROM core.application
    WHERE "workspaceId" = v_workspace_id LIMIT 1;

  -- Resolve object
  SELECT id INTO v_obj_id FROM core."objectMetadata"
    WHERE "nameSingular" = 'opportunity';

  -- Resolve the FIELDS widget view on the Home tab
  SELECT (pw.configuration->>'viewId')::UUID INTO v_view_id
  FROM core."pageLayout" pl
  JOIN core."objectMetadata" om ON om.id = pl."objectMetadataId"
  JOIN core."pageLayoutTab" plt ON plt."pageLayoutId" = pl.id
  JOIN core."pageLayoutWidget" pw ON pw."pageLayoutTabId" = plt.id
  WHERE om."nameSingular" = 'opportunity'
    AND plt.title = 'Home'
    AND pw.type = 'FIELDS';

  -- Create group if it doesn't exist
  SELECT id INTO v_group_id FROM core."viewFieldGroup"
    WHERE "viewId" = v_view_id AND name = 'Risk and Compliance';

  IF v_group_id IS NULL THEN
    INSERT INTO core."viewFieldGroup"
      ("universalIdentifier","id","name","position","isVisible",
       "viewId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES
      (gen_random_uuid(), gen_random_uuid(),
       'Risk and Compliance', 3, true,
       v_view_id, v_workspace_id, v_app_id,
       now(), now())
    RETURNING id INTO v_group_id;
    RAISE NOTICE 'Created group: Risk and Compliance → %', v_group_id;
  ELSE
    RAISE NOTICE 'Group already exists: %', v_group_id;
  END IF;

  -- Add a field to the group (idempotent — skips if already present)
  SELECT id INTO v_field_id FROM core."fieldMetadata"
    WHERE "objectMetadataId" = v_obj_id AND name = 'riskAssessment';

  IF v_field_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM core."viewField"
    WHERE "viewFieldGroupId" = v_group_id
      AND "fieldMetadataId" = v_field_id
      AND "deletedAt" IS NULL
  ) THEN
    INSERT INTO core."viewField"
      ("universalIdentifier","id","fieldMetadataId","isVisible","size","position",
       "viewId","viewFieldGroupId","workspaceId","applicationId","createdAt","updatedAt")
    VALUES
      (gen_random_uuid(), gen_random_uuid(),
       v_field_id, true, 0, 0,
       v_view_id, v_group_id, v_workspace_id, v_app_id,
       now(), now());
    RAISE NOTICE 'Added field riskAssessment to group';
  END IF;

  -- Repeat the field block above for each field to add ...

  -- Remove all FIELD card widgets from the Home tab (idempotent — no-op if already removed)
  DELETE FROM core."pageLayoutWidget"
  WHERE type = 'FIELD'
    AND "pageLayoutTabId" IN (
      SELECT plt.id
      FROM core."pageLayoutTab" plt
      JOIN core."pageLayout" pl ON pl.id = plt."pageLayoutId"
      JOIN core."objectMetadata" om ON om.id = pl."objectMetadataId"
      WHERE om."nameSingular" = 'opportunity' AND plt.title = 'Home'
    );
  RAISE NOTICE 'Removed FIELD card widgets';
END $$;
```

### Testing the migration

**Important**: Railway SSH does NOT support stdin piping. Use the `printf`
pattern to embed the base64 string in the remote command:

```bash
# Write SQL locally
cat > /tmp/layout_migration.sql << 'EOF'
-- your DO $$ ... $$ block above
EOF

# Capture base64 (single-line, no newlines) into a shell variable
B64=$(base64 -w0 /tmp/layout_migration.sql)

# Test on UAT first — should be all-[ok]/[skip], no inserts/deletes
railway ssh --environment uat --service twenty -- \
  "printf '%s' '$B64' | base64 -d > /tmp/m.sql && psql \"\$PG_DATABASE_URL\" -f /tmp/m.sql"

# Apply to production
railway ssh --environment production --service twenty -- \
  "printf '%s' '$B64' | base64 -d > /tmp/m.sql && psql \"\$PG_DATABASE_URL\" -f /tmp/m.sql"

# Flush cache
railway ssh --environment production --service twenty -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flush"
```

`base64 -w0` produces a single line with no newlines (required so the shell
variable contains no line breaks that would break the `printf` invocation).
Base64 output only contains `[A-Za-z0-9+/=]` — no single quotes — so
embedding it inside `'...'` is safe.

### Where to store layout migration scripts

Keep them alongside the Python metadata migrations:

```
/home/clive/_Projects/stratum/scripts/layout-migrations/
  001-opportunity-layout.sql
  002-company-layout.sql
  NNN-<object>-layout.sql
```

Number them to match the Python migrations they depend on (the custom fields
referenced by `name` must already exist in the target environment before the
layout migration runs).

---

## Known gotchas

1. **Orphaned viewField rows** — if a view uses `viewFieldGroup` rows, any
   `viewField` with `viewFieldGroupId = NULL` is silently ignored by the
   frontend. Always set `viewFieldGroupId`.

2. **Duplicate field display** — a field can appear twice if it is both in a
   `viewFieldGroup` (via the FIELDS widget) AND configured as a standalone
   `FIELD` card widget on the same tab. Remove one or the other.

3. **`backfill-page-layouts` partial failure** — the upgrade command may produce
   a mixed state (FIELD cards + a FIELDS widget that duplicates some of them, plus
   an empty Additional group). Inspect the widgets via Step 2 before assuming the
   layout is clean. The empty Additional group is a common symptom.

4. **Inactive fields may still be in the view** — `backfill-page-layouts` does
   not check `isActive`. Always run the inactive-fields audit query and hard-delete
   those viewField rows.

5. **`newFieldDefaultVisibility`** — this flag on the FIELDS widget configuration
   only affects the layout editor UI. It does NOT auto-show new fields at runtime.
   New fields must be explicitly added to a group.

6. **Group names with special characters** — `&` in group names fails in shell
   heredocs. Use individual `psql -c` calls or the base64 approach.

7. **Cache is sticky** — changes visible in the DB may not appear in the UI until
   `cache:flush` is run. If the page looks unchanged after a DB edit, always
   flush first before investigating further.

8. **Field label overrides** — a viewField's `overrides` JSONB column can hold a
   custom label that differs from `fieldMetadata.label`. This is how "Account Owner"
   shows as "Relationship Owner" on the company detail page. Check `vf.overrides`
   if the UI label doesn't match the metadata label.

---

## Worked example — Opportunity (2026-03-26)

```
Object: opportunity  (objectMetadataId = 442dc4eb-433f-423b-9339-a06de866300d)
Page layout: a96e5dc5-8782-4b85-acc6-4190959b0615
Home tab: 39b2aa3b-6b6f-492c-9622-40a9ce6d0e67
FIELDS widget: ac5e95c3-f8b5-46db-9bf3-7ed247a06f34
  → viewId: 40f423e8-7cfe-4a67-87b3-e2401b93bbcd (FIELDS_WIDGET view)
    Groups:
      General     (9d6b6c73): closeDate, stage, company, dealSource, currencyCustom, totalFeeRollup, tags
      Additional  (f77c0bec): pointOfContact, owner, arranger, originator
      Other       (b100fecd): createdAt, createdBy
      Risk and Compliance (aaaaaaaa-0001): jurisdictionsInvolved, riskAssessment,
                  riskAssessmentResult, riskCommitteeDecision,
                  riskCommitteeDecisionNotes, lossReason, lossNotes

Workspace: 8b36bd60-ed50-4630-9a45-8b0286fc6106
Application: f42d44ad-d5cc-4248-b995-25412c54f0e2
```
