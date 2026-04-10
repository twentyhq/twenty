---
name: db-field-lookup
description: >
  Query the Twenty Railway Postgres metadata tables to find object names,
  field names, field IDs, relation settings, and other schema information.
  AUTOMATICALLY invoke this skill whenever you need a fieldMetadataId,
  joinColumnName, objectMetadataId, relation type, or any schema detail that
  lives in the database rather than the source code — do not guess or assume
  these values. Also user-invocable with /db-field-lookup <query>.
user-invocable: true
allowed-tools: Bash(railway:*), Bash(psql:*), Bash(echo:*)
---

# db-field-lookup

Look up Twenty CRM metadata (objects, fields, relations) from the live Railway Postgres database.

## Connection

Get the DATABASE_PUBLIC_URL from Railway, then use psql. Must run from a directory linked to the project (e.g. `/home/clive/_Projects/stratum/twenty`). The `--project` flag is NOT supported by the current CLI version — rely on the linked context instead:

```bash
DB_URL=$(cd /home/clive/_Projects/stratum/twenty && railway variables --service Postgres --environment production --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('DATABASE_PUBLIC_URL', d.get('DATABASE_URL','')))")
psql "$DB_URL" -c "<SQL>"
```

If `railway variables` fails (stale token), tell the user to run `railway login` first.

## Key Tables (all in the `core` schema)

| Table | Key Columns | Purpose |
|---|---|---|
| `core."objectMetadata"` | `id`, `nameSingular`, `namePlural`, `labelSingular`, `isCustom` | All objects (standard + custom) |
| `core."fieldMetadata"` | `id`, `name`, `label`, `type`, `objectMetadataId`, `settings`, `isCustom` | All fields on all objects |

## Common Queries

### All fields on an object
```sql
SELECT fm.id, fm.name, fm.label, fm.type, fm."isCustom"
FROM core."fieldMetadata" fm
JOIN core."objectMetadata" om ON fm."objectMetadataId" = om.id
WHERE om."nameSingular" = '<objectName>'
ORDER BY fm.type, fm.name;
```

### Find a specific field by name
```sql
SELECT fm.id, fm.name, fm.label, fm.type, fm.settings, om."nameSingular"
FROM core."fieldMetadata" fm
JOIN core."objectMetadata" om ON fm."objectMetadataId" = om.id
WHERE fm.name ILIKE '%<fieldName>%';
```

### Relation field details (joinColumnName, relationType, etc.)
```sql
SELECT fm.id, fm.name, fm.label, fm.settings
FROM core."fieldMetadata" fm
JOIN core."objectMetadata" om ON fm."objectMetadataId" = om.id
WHERE om."nameSingular" = '<objectName>' AND fm.type = 'RELATION';
```

### List all objects
```sql
SELECT "nameSingular", "namePlural", "labelSingular", "isCustom"
FROM core."objectMetadata"
ORDER BY "isCustom", "nameSingular";
```

### Find fieldMetadataId for a named field on a named object
```sql
SELECT fm.id AS "fieldMetadataId", fm.name, fm.label, fm.type
FROM core."fieldMetadata" fm
JOIN core."objectMetadata" om ON fm."objectMetadataId" = om.id
WHERE om."nameSingular" = '<objectName>'
  AND fm.name = '<fieldName>';
```

## Steps

1. Parse the user's query to determine what they're looking for (field ID, relation info, all fields on an object, etc.).
2. Choose the most appropriate query from the templates above (or compose a new one).
3. Fetch the DATABASE_PUBLIC_URL via `railway variables` (cd to `/home/clive/_Projects/stratum/twenty` first; do NOT use `--project` flag).
4. Run the query with `psql`.
5. Return the results clearly formatted — include the `id` column whenever the user may need it for code.

## Notes

- Railway project: `lavish-magic` (ID: `92c3397f-bef8-4f1c-800d-927e58ad5171`)
- Environment: `production`
- Postgres service ID: `441775e9-012a-42fd-98ee-dd754f5106a5`
- All metadata lives in the `core` schema. Workspace data (actual records) lives in per-workspace schemas (UUID-named).
- `settings` column is JSONB — for RELATION fields it contains `joinColumnName`, `relationType`, `onDeleteAction`, etc.
- Custom fields (`isCustom: true`) are those added via the Twenty UI; standard fields are from the codebase.
