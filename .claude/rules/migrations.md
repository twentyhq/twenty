---
paths:
  - "**/migrations/*.sql"
  - "**/schema/*.sql"
---

# SQL Migration Rules

## File Naming

- Pattern: `{NNN}_{description}.sql`
- Example: `001_create_context_tables.sql`
- Sequential numbering, never reuse numbers

## Table Requirements

```sql
CREATE TABLE {schema}.{table} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES core.workspaces(id),
  -- other columns
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE {schema}.{table} ENABLE ROW LEVEL SECURITY;

-- Workspace isolation policy
CREATE POLICY "{table}_workspace_isolation" ON {schema}.{table}
  USING (workspace_id = current_setting('app.workspace_id')::uuid);
```

## Indexes

- Always index `workspace_id`
- Add composite indexes for common query patterns
- Use `CONCURRENTLY` for production indexes

## Verification

After migration:
1. Run `supabase db push`
2. Verify RLS with test queries
3. Update TypeScript types: `supabase gen types typescript`