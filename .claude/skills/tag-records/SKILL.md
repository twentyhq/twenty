---
name: tag-records
description: >
  Tag a selection of CRM records (people or accounts) with one or more tags.
  Resolves tag IDs, identifies target records by a filter, inserts rows into
  the junction table with a NOT EXISTS guard, and flushes the cache.
user-invocable: true
allowed-tools: Bash, Read, Write, mcp__postgres__query
---

# tag-records

Tag a selection of records (people, accounts, or any other tagged object) with
one or more tags. Works on both UAT and production.

## Overview

Tags in Twenty are implemented as junction tables:

- **Account Tags** — `workspace_<id>."_accounttag"` with columns `accountId` and `tagId`
- **Person Tags** — `workspace_<id>."_persontag"` with columns `personId` and `tagId`

The `tag` table lives in the workspace schema and is shared across both object
types. A tag is identified by its `name` column.

## Step 1 — Identify the workspace schema

```sql
SELECT table_schema FROM information_schema.tables
WHERE table_name = 'tag' AND table_schema LIKE 'workspace_%'
LIMIT 1;
```

On UAT: `workspace_88pd7l5mqn69yo7kctctadczq`
On production: query above to confirm.

## Step 2 — Resolve tag IDs (create if missing)

```sql
-- Look up existing tags
SELECT id, name FROM workspace_<schema>.tag
WHERE name IN ('Tag One', 'Tag Two') AND "deletedAt" IS NULL;

-- Create missing tags (run once per missing tag)
INSERT INTO workspace_<schema>.tag (id, name, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'New Tag Name', now(), now())
RETURNING id, name;
```

Tags are plain rows — no metadata or feature flag required to create them.

## Step 3 — Identify target records

Build a SELECT query that returns the IDs of the records to tag. Common patterns:

### By import date (records imported today)
```sql
SELECT id FROM workspace_<schema>.person
WHERE "deletedAt" IS NULL
  AND "createdAt" >= '2026-04-07'  -- use absolute date, not now()
ORDER BY "createdAt";
```

### By company name
```sql
SELECT p.id FROM workspace_<schema>.person p
JOIN workspace_<schema>."personToCompany" ptc ON ptc."personId" = p.id
JOIN workspace_<schema>.company c ON c.id = ptc."companyId"
WHERE c.name ILIKE '%Acme%'
  AND p."deletedAt" IS NULL;
```

### By email domain
```sql
SELECT id FROM workspace_<schema>.person
WHERE "deletedAt" IS NULL
  AND (emails->>'primaryEmail') ILIKE '%@acme.com';
```

### By account group / list
```sql
SELECT p.id FROM workspace_<schema>.person p
JOIN workspace_<schema>."personToCompany" ptc ON ptc."personId" = p.id
JOIN workspace_<schema>.company c ON c.id = ptc."companyId"
JOIN workspace_<schema>."_accountGroupTocompany" agtc ON agtc."companyId" = c.id
JOIN workspace_<schema>."accountGroup" ag ON ag.id = agtc."accountGroupId"
WHERE ag.name = 'Atlantic Star'
  AND p."deletedAt" IS NULL;
```

Always do a COUNT(*) dry run first:
```sql
SELECT count(*) FROM ( <your SELECT above> ) sub;
```

## Step 4 — Insert junction rows (idempotent)

Write to a temp file and execute via base64 pipe to avoid shell quoting issues.

```sql
-- /tmp/tag_records.sql
DO $$
DECLARE
  v_tag_id_1  UUID := '<resolved-tag-id-1>';
  v_tag_id_2  UUID := '<resolved-tag-id-2>';
  v_count_1   INT;
  v_count_2   INT;
BEGIN
  -- Tag 1
  INSERT INTO workspace_<schema>."_persontag" ("id", "personId", "tagId", "createdAt", "updatedAt")
  SELECT gen_random_uuid(), sub.id, v_tag_id_1, now(), now()
  FROM (
    SELECT id FROM workspace_<schema>.person
    WHERE "deletedAt" IS NULL
      AND "createdAt" >= '2026-04-07'
  ) sub
  WHERE NOT EXISTS (
    SELECT 1 FROM workspace_<schema>."_persontag" pt
    WHERE pt."personId" = sub.id AND pt."tagId" = v_tag_id_1
  );
  GET DIAGNOSTICS v_count_1 = ROW_COUNT;
  RAISE NOTICE 'Inserted % rows for tag 1', v_count_1;

  -- Tag 2 (repeat pattern)
  INSERT INTO workspace_<schema>."_persontag" ("id", "personId", "tagId", "createdAt", "updatedAt")
  SELECT gen_random_uuid(), sub.id, v_tag_id_2, now(), now()
  FROM (
    SELECT id FROM workspace_<schema>.person
    WHERE "deletedAt" IS NULL
      AND "createdAt" >= '2026-04-07'
  ) sub
  WHERE NOT EXISTS (
    SELECT 1 FROM workspace_<schema>."_persontag" pt
    WHERE pt."personId" = sub.id AND pt."tagId" = v_tag_id_2
  );
  GET DIAGNOSTICS v_count_2 = ROW_COUNT;
  RAISE NOTICE 'Inserted % rows for tag 2', v_count_2;
END $$;
```

Execute on UAT via Railway SSH:
```bash
B64=$(base64 -w0 /tmp/tag_records.sql)
railway ssh --environment uat --service twenty -- \
  "printf '%s' '$B64' | base64 -d > /tmp/tr.sql && psql \"\$PG_DATABASE_URL\" -f /tmp/tr.sql"
```

Or directly via the Postgres MCP (read-write connection not available — use Railway SSH for writes).

## Step 5 — Verify

```sql
-- Count tags applied per tag
SELECT t.name, count(*) AS tagged
FROM workspace_<schema>."_persontag" pt
JOIN workspace_<schema>.tag t ON t.id = pt."tagId"
WHERE t.name IN ('Tag One', 'Tag Two')
GROUP BY t.name;
```

## Step 6 — Flush cache (if tags don't appear in the UI)

Tag junction rows update immediately in the database but the flat entity cache
may hold stale relation data. If chips don't appear after tagging:

```bash
railway ssh --environment uat --service twenty -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flush"
```

---

## Junction table names by object

| Object  | Junction table    | Person/Account column | Tag column |
|---------|-------------------|-----------------------|------------|
| Person  | `_persontag`      | `personId`            | `tagId`    |
| Account | `_accounttag`     | `accountId`           | `tagId`    |

Both tables live in the workspace schema and share the same `tag` table.

---

## Notes

- Tag names are case-sensitive in queries; use exact case matching.
- The `NOT EXISTS` guard makes inserts idempotent — safe to run multiple times.
- Tags created via direct SQL are immediately visible in the UI (no sync needed).
- The `persontag` and `accounttag` objects require the `IS_JUNCTION_RELATIONS_ENABLED`
  feature flag and `junctionTargetFieldId` set on the relation field — these are
  already configured on both UAT and production (scripts 007/011).
- Use absolute dates (not `CURRENT_DATE`) in WHERE clauses when writing scripts
  that will be re-run — so the target set stays stable.
