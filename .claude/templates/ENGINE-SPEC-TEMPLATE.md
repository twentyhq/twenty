# ENGINE-SPEC: {Engine Name}

> **Status:** Draft | In Progress | Complete
> **Owner:** {Name}
> **Schema:** `{schema_name}`
> **MCP Service:** `{domain}-mcp`
> **Port:** {port}

---

## 1. Purpose

> One paragraph: What problem does this engine solve?

{Description}

---

## 2. Concept Mapping

| Concept | How This Engine Supports It |
|---------|----------------------------|
| {Concept} | {Description} |

---

## 3. Aggregates & Entities

### Aggregates Used (from `core`)

| Aggregate | How It's Used |
|-----------|---------------|
| Workspace | {usage} |
| Profile | {usage} |

### Entities Owned (in this engine's schema)

| Entity | Purpose | Belongs To |
|--------|---------|------------|
| {entity} | {purpose} | {aggregate} |

### Value Objects

| Value Object | Belongs To | Attributes |
|--------------|------------|------------|
| {value_object} | {entity or aggregate} | {attributes} |

---

## 4. Schema Design

### Schema Creation

```sql
CREATE SCHEMA IF NOT EXISTS {schema_name};
```

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `{schema}.{table}` | {purpose} | {columns} |

### Required Columns (All Tables)

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
workspace_id UUID NOT NULL REFERENCES core.workspace(id),
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
```

### RLS Policy Pattern

```sql
ALTER TABLE {schema}.{table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY workspace_isolation ON {schema}.{table}
  FOR ALL
  USING (workspace_id = current_setting('app.workspace_id')::uuid);
```

---

## 5. Context Engine Integration

> **Mandatory section.** Every engine must declare its relationship with the Context Engine.

### 5.1 Context Dependency

| Aspect | This Engine's Relationship |
|--------|---------------------------|
| **Consumes Context** | {Yes/No} - {How it uses context from Context Engine} |
| **Produces Attributes** | {Yes/No} - {What attributes it creates/updates} |
| **Emits Events for Context** | {Yes/No} - {What events Context Engine listens to} |

### 5.2 Attributes Produced

> If this engine creates or updates attributes, list them here.

| Attribute Code | When Created | Source Type | Description |
|----------------|--------------|-------------|-------------|
| {attribute_code} | {Trigger event} | {auto/cert/assess/self} | {What it represents} |

### 5.3 Context Events Emitted

> Events that the Context Engine subscribes to from this engine.

| Event Type | Triggers | Context Engine Action |
|------------|----------|----------------------|
| `{domain}.{aggregate}.{action}` | {When} | {What Context Engine does with it} |

### 5.4 Context Tools Used

> If this engine calls Context Engine tools.

| Tool | When Used | Purpose |
|------|-----------|---------|
| `context_get_context` | {When} | {Why} |
| `context_get_attributes` | {When} | {Why} |
| `context_set_attribute` | {When} | {Why} |

---

## 6. Events

### Events Emitted

| Event Type | Trigger | Payload |
|------------|---------|---------|
| `{domain}.{aggregate}.{action}` | {when} | {what} |

### Events Consumed

| Event Type | Action |
|------------|--------|
| `{domain}.{aggregate}.{action}` | {what this engine does} |

---

## 7. MCP Service

### Service Info

| Property | Value |
|----------|-------|
| Name | `{domain}-mcp` |
| Port | {port} |
| Schema | `{schema}` |
| Dependencies | {core, events, context, etc.} |

### MCP Tools

| Tool | Type | Purpose |
|------|------|---------|
| `{domain}_{verb}_{noun}` | Read/Write | {purpose} |

### Tool Naming Rules

- Format: `{domain}_{verb}_{noun}`
- Verbs: get, list, create, update, delete, enroll, complete

---

## 8. Caching

### Cache Keys

| Key Pattern | TTL | Invalidation |
|-------------|-----|--------------|
| `{schema}:{workspace_id}:{entity}:{id}` | {ttl} | {trigger} |

### Prefetch Triggers

| Trigger | What to Warm |
|---------|--------------|
| {event or action} | {cache keys} |

---

## 9. Integration Points

| System | Direction | Purpose |
|--------|-----------|---------|
| Context Engine | This → Context | {Emits events, produces attributes} |
| Context Engine | Context → This | {Consumes context for decisions} |
| {other} | {direction} | {purpose} |

---

## 10. Health & Observability

### Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Liveness check |
| `GET /ready` | Readiness check |

### Key Metrics

| Metric | Type |
|--------|------|
| `{domain}_operations_total` | Counter |
| `{domain}_operation_duration_seconds` | Histogram |

---

## 11. File Structure

```
engines/{domain}/
├── README.md                      ← This spec
├── schema/
│   └── migrations/
│       └── {number}_{domain}_schema.sql
├── handlers/                      ← Command handlers
│   ├── {command}.handler.ts
│   └── index.ts
├── presenters/                    ← Response formatters
│   ├── {resource}.presenter.ts
│   └── index.ts
└── tests/
    ├── unit/
    └── integration/
```

### Deployment (in deployments/ folder)

```
deployments/{domain}-mcp/
├── src/
│   ├── mcp-server/
│   │   └── tools/definitions/
│   │       ├── {domain}-{tool}.tool.ts
│   │       └── index.ts
│   └── container/
├── Dockerfile
├── package.json
└── README.md
```

---

## 12. Migration Files

Location: `engines/{domain}/schema/migrations/`

```
{number}_{domain}_schema.sql
```

---

## 13. Acceptance Criteria

- [ ] Schema created with RLS
- [ ] All tables have workspace isolation
- [ ] MCP service runs on assigned port
- [ ] All tools implemented
- [ ] Events emitted correctly
- [ ] **Context integration documented**
- [ ] **Attributes produced are registered**
- [ ] **Context events consumed properly**
- [ ] Caching implemented
- [ ] Health endpoints working
- [ ] Docker compose updated
- [ ] Tests passing

---

## 14. Out of Scope

- {What this engine does NOT handle}
- {Refer to other engines for X}

---

## References

- [AI Layer Architecture](./AI-LAYER-ARCHITECTURE.md)
- [PRD](./AI-LAYER-PRD.md)
- [Context Engine Spec](../context/README.md)