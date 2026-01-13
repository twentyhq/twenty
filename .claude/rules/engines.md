---
paths:
  - engines/**/*.ts
  - engines/**/*.sql
---

# Engine Development Rules

## Database Requirements

- Every table MUST have `workspace_id UUID NOT NULL`
- Every query MUST filter by `workspace_id` — no exceptions
- Use RLS policies for workspace isolation
- Use `gen_random_uuid()` for primary keys
- Include `created_at`, `updated_at` timestamps

## Handler Pattern

```typescript
export async function handle{Action}(
  supabase: SupabaseClient,
  workspaceId: string,
  params: {Params}
): Promise<{Result}> {
  const { data, error } = await supabase
    .from('schema.table')
    .select('*')
    .eq('workspace_id', workspaceId)  // ALWAYS FIRST
    .eq('id', params.id);

  if (error) throw new DatabaseError(error);
  return data;
}
```

## Events

- Emit events via CloudEvents format
- Pattern: `{schema}.{entity}.{action}`
- Example: `context.mode.changed`, `knowledge.document.indexed`

## Testing

- Mock Supabase client in tests
- Test workspace isolation (cross-workspace access should fail)
- Test error cases explicitly