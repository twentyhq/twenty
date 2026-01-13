---
paths:
  - deployments/**/*.ts
  - deployments/**/Dockerfile
  - deployments/**/docker-compose.yml
---

# Deployment Rules

## MCP Tool Naming

- Pattern: `{domain}_{verb}_{noun}`
- Examples: `ctx_get_context`, `kb_search_documents`
- Always include `workspace_id` as required parameter

## MCP Tool Structure

```typescript
export const myTool: ToolDefinition = {
  name: '{domain}_{verb}_{noun}',
  description: 'Clear description of what this does',
  inputSchema: {
    type: 'object',
    properties: {
      workspace_id: { type: 'string', description: 'Workspace ID' },
      // ... other params
    },
    required: ['workspace_id']
  },
  handler: async (params) => {
    // Call engine handler, never direct DB
  }
};
```

## Dockerfile Requirements

- Use `oven/bun:latest` as base
- Multi-stage builds for production
- Include health check
- Don't copy `.env` files

## Health Endpoints

Every service MUST expose:
- `GET /health` — Process running (liveness)
- `GET /ready` — Can serve requests (readiness)

## Environment Variables

- Document ALL required vars in `.env.example`
- Use `op://` references in `.env.template` for 1Password
- Never hardcode secrets