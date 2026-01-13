# Guide: Creating a New Engine

> **Purpose:** Step-by-step instructions for adding a new engine to the AI Layer.  
> **Audience:** Developers  
> **Time:** 2-4 hours for initial setup

---

## Prerequisites

Before starting, ensure you have:

- [ ] Read [AI Layer Architecture](./AI-LAYER-ARCHITECTURE.md)
- [ ] Read [AI Layer PRD](./AI-LAYER-PRD.md) – engine definitions
- [ ] Read [Context Engine Spec](../engines/context/README.md) – **required**
- [ ] Access to Supabase project
- [ ] Docker environment set up
- [ ] Familiarity with MCP protocol

---

## Step 1: Define the Engine

### 1.1 Confirm Engine Scope

Before creating, verify this should be an engine (not a module or adapter):

| If it... | It's a... |
|----------|-----------|
| Has dedicated schema and core computation | **Engine** ✅ |
| Combines multiple engines for a product feature | Module |
| Connects to external system | Adapter |

### 1.2 Create Engine Spec

Copy the template:

```bash
cp docs/templates/ENGINE-SPEC-TEMPLATE.md engines/{domain}/README.md
```

Fill in:
- Purpose
- Responsibilities (what it does)
- Boundaries (what it does NOT do)
- Dependencies
- **Context Engine integration** (see Step 3)

**Do not proceed until the spec is reviewed.**

---

## Step 2: Create Folder Structure

```bash
mkdir -p engines/{domain}/schema/migrations
mkdir -p engines/{domain}/handlers
mkdir -p engines/{domain}/presenters
mkdir -p engines/{domain}/tests/unit
mkdir -p engines/{domain}/tests/integration
```

Result:

```
engines/{domain}/
├── README.md              ← Engine spec (from Step 1)
├── schema/
│   └── migrations/        ← SQL migrations
├── handlers/              ← Command handlers
├── presenters/            ← Response formatters
└── tests/
    ├── unit/
    └── integration/
```

---

## Step 3: Define Context Engine Integration

> **This step is mandatory.** Every engine must declare its relationship with the Context Engine.

### 3.1 Determine Integration Type

| Integration Type | Description | Example Engines |
|------------------|-------------|-----------------|
| **Producer** | Creates/updates attributes | Learning, Journey, Operation |
| **Consumer** | Uses context for decisions | Communication, Business |
| **Both** | Produces and consumes | Operation (creates punctuality, uses context for assignments) |
| **Minimal** | Only emits events Context listens to | Payroll |

### 3.2 Document Attributes Produced

If your engine creates attributes, list them:

```markdown
| Attribute Code | When Created | Source Type | Description |
|----------------|--------------|-------------|-------------|
| punctuality | Shift clock-in | auto | On-time percentage |
| wine_knowledge | Quiz completed | quiz | Wine expertise level |
| food_safety | Cert uploaded | cert | Food safety certification |
```

### 3.3 Document Events for Context

List events that Context Engine should subscribe to:

```markdown
| Event Type | Triggers | What Context Engine Does |
|------------|----------|--------------------------|
| `learning.quiz.completed` | Quiz finished | Updates knowledge attribute |
| `journey.enrollment.completed` | Training done | Creates capability attribute |
| `operation.shift.clock_in` | Worker clocks in | Updates punctuality attribute |
```

### 3.4 Document Context Usage

If your engine consumes context:

```markdown
| Tool Used | When | Purpose |
|-----------|------|---------|
| `context_get_context` | Before operation | Get mode and relevant attributes |
| `context_get_attributes` | Worker assignment | Check capabilities |
| `context_calculate_relevance` | Ranking | Score workers for task |
```

---

## Step 4: Create Database Schema

### 4.1 Create Schema

Create migration file: `engines/{domain}/schema/migrations/001_create_schema.sql`

```sql
-- Migration: 001_create_schema
-- Engine: {domain}
-- Created: {date}

-- Create schema
CREATE SCHEMA IF NOT EXISTS {domain};

-- Grant permissions
GRANT USAGE ON SCHEMA {domain} TO authenticated;
GRANT USAGE ON SCHEMA {domain} TO service_role;
```

### 4.2 Create Tables

Create migration file: `engines/{domain}/schema/migrations/002_create_tables.sql`

```sql
-- Migration: 002_create_tables
-- Engine: {domain}

-- Example table (replace with actual)
CREATE TABLE {domain}.{entity} (
    -- Required columns (all tables must have these)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES core.workspace(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Entity-specific columns
    {column} {type},
    
    -- Foreign keys to aggregates use ID only
    profile_id UUID NOT NULL  -- References core.profile(id)
);

-- Index for workspace isolation
CREATE INDEX idx_{entity}_workspace ON {domain}.{entity}(workspace_id);

-- Enable RLS
ALTER TABLE {domain}.{entity} ENABLE ROW LEVEL SECURITY;

-- Workspace isolation policy
CREATE POLICY workspace_isolation ON {domain}.{entity}
    FOR ALL
    USING (workspace_id = current_setting('app.workspace_id')::uuid);

-- Updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON {domain}.{entity}
    FOR EACH ROW
    EXECUTE FUNCTION core.set_updated_at();
```

### 4.3 Apply Migrations

```bash
# Via Supabase CLI
supabase db push

# Or via psql
psql $DATABASE_URL -f engines/{domain}/schema/migrations/001_create_schema.sql
psql $DATABASE_URL -f engines/{domain}/schema/migrations/002_create_tables.sql
```

---

## Step 5: Create Handlers

Handlers process incoming commands.

### 5.1 Context-Aware Handler Pattern

**Every handler that needs user context should get it first:**

Create `engines/{domain}/handlers/{command}.handler.ts`:

```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { ContextClient } from '../../../shared/context-client';

interface {Command}Input {
    workspace_id: string;
    profile_id: string;
    // ... other fields
}

interface {Command}Output {
    success: boolean;
    result?: {
        // ... result fields
    };
    error?: string;
}

export async function handle{Command}(
    supabase: SupabaseClient,
    contextClient: ContextClient,
    input: {Command}Input
): Promise<{Command}Output> {
    // Validate input
    if (!input.workspace_id) {
        return { success: false, error: 'workspace_id is required' };
    }

    try {
        // STEP 1: Get context (if needed for this operation)
        const context = await contextClient.getContext({
            workspace_id: input.workspace_id,
            profile_id: input.profile_id,
            query: '{command} operation',
            depth: 'standard'
        });

        // STEP 2: Check mode if relevant
        if (context.mode !== 'business') {
            return { 
                success: false, 
                error: 'This operation requires business mode' 
            };
        }

        // STEP 3: Check required attributes
        const requiredAttr = context.attributes.find(
            a => a.code === 'required_attribute'
        );
        if (!requiredAttr || requiredAttr.level < 2) {
            return {
                success: false,
                error: 'Insufficient capability level'
            };
        }

        // STEP 4: Execute business logic
        const { data, error } = await supabase
            .from('{domain}.{table}')
            .select('*')
            .eq('workspace_id', input.workspace_id);

        if (error) throw error;

        // STEP 5: Emit event (Context Engine may subscribe)
        await emitEvent(supabase, '{domain}.{entity}.{action}', {
            workspace_id: input.workspace_id,
            profile_id: input.profile_id,
            result_id: data.id
        });

        return {
            success: true,
            result: data
        };
    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
}
```

### 5.2 Attribute-Producing Handler

If your handler creates/updates attributes:

```typescript
export async function handleQuizCompleted(
    supabase: SupabaseClient,
    contextClient: ContextClient,
    input: QuizCompletedInput
): Promise<QuizCompletedOutput> {
    try {
        // Calculate new attribute level from quiz score
        const newLevel = calculateLevel(input.score);

        // Update attribute via Context Engine
        await contextClient.setAttribute({
            workspace_id: input.workspace_id,
            entity_id: input.profile_id,
            entity_type: 'worker',
            attribute_code: 'wine_knowledge',
            level: newLevel,
            modes: ['business', 'hobby'],
            source: 'quiz'
        });

        // Emit event
        await emitEvent(supabase, 'learning.quiz.completed', {
            workspace_id: input.workspace_id,
            profile_id: input.profile_id,
            quiz_id: input.quiz_id,
            score: input.score,
            new_level: newLevel
        });

        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}
```

### 5.3 Create Handler Index

Create `engines/{domain}/handlers/index.ts`:

```typescript
// Engine: {domain}
// Handlers index

export * from './{command}.handler';
```

---

## Step 6: Create Presenters

Presenters format outgoing responses.

Create `engines/{domain}/presenters/{resource}.presenter.ts`:

```typescript
interface {Resource}Internal {
    id: string;
    workspace_id: string;
    created_at: string;
    // ... internal fields
}

interface {Resource}Response {
    id: string;
    // ... external fields (no workspace_id)
}

export function present{Resource}(internal: {Resource}Internal): {Resource}Response {
    return {
        id: internal.id,
        // Map fields, exclude internal data
    };
}

export function present{Resource}List(internals: {Resource}Internal[]): {Resource}Response[] {
    return internals.map(present{Resource});
}
```

---

## Step 7: Create Deployment

### 7.1 Create Deployment Folder

```bash
mkdir -p deployments/{domain}-mcp/src
```

### 7.2 Create MCP Server

Create `deployments/{domain}-mcp/src/index.ts`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ContextClient } from '../../../shared/context-client';

// Import handlers and presenters
import { handle{Command} } from '../../../engines/{domain}/handlers';
import { present{Resource} } from '../../../engines/{domain}/presenters';

// Initialize context client
const contextClient = new ContextClient({
    url: process.env.CONTEXT_MCP_URL || 'http://ctx-mcp:3100'
});

const server = new Server(
    {
        name: '{domain}-mcp',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Register tools
server.setRequestHandler('tools/list', async () => ({
    tools: [
        {
            name: '{domain}_get_{resource}',
            description: 'Get {resource} for a workspace',
            inputSchema: {
                type: 'object',
                properties: {
                    workspace_id: { type: 'string', description: 'Workspace ID' },
                    profile_id: { type: 'string', description: 'Profile ID (for context)' },
                },
                required: ['workspace_id'],
            },
        },
        // ... more tools
    ],
}));

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
        case '{domain}_get_{resource}': {
            // Pass contextClient to handler
            const result = await handle{Command}(supabase, contextClient, args);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(present{Resource}(result)),
                    },
                ],
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(console.error);
```

### 7.3 Create Dockerfile

Create `deployments/{domain}-mcp/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy shared utilities (including context client)
COPY shared ./shared

# Copy engine and deployment code
COPY engines/{domain} ./engines/{domain}
COPY deployments/{domain}-mcp ./deployments/{domain}-mcp

# Build
RUN npm run build

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:${PORT}/health || exit 1

EXPOSE ${PORT}

CMD ["node", "dist/deployments/{domain}-mcp/src/index.js"]
```

### 7.4 Add to Docker Compose

Add to `stacks/docker/docker-compose.yml`:

```yaml
{domain}-mcp:
  image: smartout/{domain}-mcp:${VERSION:-latest}
  container_name: smartout-{domain}-mcp
  restart: unless-stopped
  ports:
    - "{port}:{port}"
  environment:
    - {DOMAIN}_PORT={port}
    - {DOMAIN}_LOG_LEVEL=${LOG_LEVEL:-info}
    - SUPABASE_URL=${SUPABASE_URL}
    - SUPABASE_KEY=${SUPABASE_SERVICE_KEY}
    - REDIS_URL=redis://redis:6379
    - CONTEXT_MCP_URL=http://ctx-mcp:3100  # Context Engine dependency
  networks:
    - smartout-ai-network
  depends_on:
    ctx-mcp:              # Depends on Context Engine
      condition: service_healthy
    redis:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "wget", "-q", "--spider", "http://localhost:{port}/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 60s
  labels:
    - "smartout.deployment={domain}-mcp"
    - "smartout.type=mcp"
    - "smartout.engine={domain}"
```

**Note:** All engines depend on `ctx-mcp` (Context Engine).

---

## Step 8: Create Tests

### 8.1 Context Integration Tests

Create `engines/{domain}/tests/integration/context.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { handle{Command} } from '../../handlers/{command}.handler';
import { MockContextClient } from '../../../shared/test-utils';

describe('{Domain} Context Integration', () => {
    let mockContext: MockContextClient;

    beforeEach(() => {
        mockContext = new MockContextClient();
    });

    it('should respect mode', async () => {
        mockContext.setMode('private');
        
        const result = await handle{Command}(mockSupabase, mockContext, {
            workspace_id: 'ws_123',
            profile_id: 'prf_456'
        });
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('business mode');
    });

    it('should check required attributes', async () => {
        mockContext.setMode('business');
        mockContext.setAttributes([
            { code: 'required_attribute', level: 1 }  // Below required level
        ]);
        
        const result = await handle{Command}(mockSupabase, mockContext, {
            workspace_id: 'ws_123',
            profile_id: 'prf_456'
        });
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('capability');
    });

    it('should proceed with valid context', async () => {
        mockContext.setMode('business');
        mockContext.setAttributes([
            { code: 'required_attribute', level: 3 }
        ]);
        
        const result = await handle{Command}(mockSupabase, mockContext, {
            workspace_id: 'ws_123',
            profile_id: 'prf_456'
        });
        
        expect(result.success).toBe(true);
    });
});
```

### 8.2 Attribute Production Tests

If your engine produces attributes:

```typescript
describe('{Domain} Attribute Production', () => {
    it('should update attribute on quiz completion', async () => {
        const setAttribute = vi.spyOn(mockContext, 'setAttribute');
        
        await handleQuizCompleted(mockSupabase, mockContext, {
            workspace_id: 'ws_123',
            profile_id: 'prf_456',
            quiz_id: 'quiz_789',
            score: 85
        });
        
        expect(setAttribute).toHaveBeenCalledWith({
            workspace_id: 'ws_123',
            entity_id: 'prf_456',
            entity_type: 'worker',
            attribute_code: 'wine_knowledge',
            level: expect.any(Number),
            modes: ['business', 'hobby'],
            source: 'quiz'
        });
    });
});
```

### 8.3 Run Tests

```bash
npm test engines/{domain}
```

---

## Step 9: Emit Events

### 9.1 Create Event Helper

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

interface CloudEvent {
    specversion: '1.0';
    id: string;
    type: string;
    source: string;
    time: string;
    datacontenttype: 'application/json';
    data: Record<string, unknown>;
}

export async function emitEvent(
    supabase: SupabaseClient,
    type: string,
    data: Record<string, unknown>
): Promise<void> {
    const event: CloudEvent = {
        specversion: '1.0',
        id: `evt_${crypto.randomUUID()}`,
        type,
        source: 'urn:smartout:{domain}-mcp',
        time: new Date().toISOString(),
        datacontenttype: 'application/json',
        data,
    };

    await supabase.from('events.event').insert(event);
}
```

### 9.2 Document Events for Context Engine

In your engine README, document which events Context Engine should subscribe to:

```markdown
## Events for Context Engine

| Event Type | When | Context Engine Action |
|------------|------|----------------------|
| `{domain}.quiz.completed` | Quiz finished | Call `context_set_attribute` for knowledge |
| `{domain}.cert.uploaded` | Cert added | Call `context_set_attribute` for certification |
| `{domain}.shift.clock_in` | Worker clocks in | Update punctuality calculation |
```

---

## Step 10: Deploy

### 10.1 Build Image

```bash
docker build -t smartout/{domain}-mcp:latest -f deployments/{domain}-mcp/Dockerfile .
```

### 10.2 Start Service

```bash
docker-compose up -d {domain}-mcp
```

### 10.3 Verify Health

```bash
curl http://localhost:{port}/health
```

### 10.4 Verify Context Connection

```bash
# Check that engine can reach Context Engine
docker logs smartout-{domain}-mcp | grep "context"
```

---

## Step 11: Document

### 11.1 Update PRD

Add engine to AI-LAYER-PRD.md engine list.

### 11.2 Update Tech Spec

Add deployment to AI-LAYER-TECHNICAL-SPEC.md service inventory.

### 11.3 Complete Engine Spec

Ensure `engines/{domain}/README.md` has all sections filled, especially:
- [ ] Section 5: Context Engine Integration
- [ ] Attributes produced (if any)
- [ ] Events that Context Engine subscribes to

### 11.4 Notify Context Engine Team

If your engine produces attributes or emits events for Context Engine, ensure:
- [ ] Context Engine event subscriptions updated
- [ ] Attribute definitions registered
- [ ] Attribute calculation logic documented

---

## Checklist

```markdown
Before marking engine complete:

### Context Integration (REQUIRED)
[ ] Context integration type determined (producer/consumer/both)
[ ] Attributes produced documented
[ ] Events for Context Engine documented
[ ] Context client integrated into handlers (if consumer)
[ ] setAttribute calls implemented (if producer)
[ ] Context-specific tests passing
[ ] Docker Compose depends_on ctx-mcp

### Standard
[ ] Engine spec reviewed and approved
[ ] Schema created with RLS
[ ] Handlers implemented
[ ] Presenters implemented
[ ] MCP tools registered
[ ] Health endpoint working
[ ] Unit tests passing
[ ] Integration tests passing
[ ] Events emitting correctly
[ ] Docker image built
[ ] Docker Compose updated
[ ] Documentation updated
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Not integrating with Context Engine | **Every engine must document context relationship** |
| Forgetting `depends_on: ctx-mcp` | Add to Docker Compose |
| Not checking mode in handlers | Get context first, check mode |
| Producing attributes without Context Engine | Use `context_set_attribute`, don't write directly |
| Missing context integration tests | Add tests for mode, attributes |
| Forgetting `workspace_id` | Add to every table, every query |
| Writing to `core` directly | Emit events instead |
| Using `user_id` | Use `profile_id` |
| Missing RLS | Enable on every table |
| No health endpoint | Add `/health` route |

---

## Need Help?

- Architecture questions → AI-LAYER-ARCHITECTURE.md
- Engine definitions → AI-LAYER-PRD.md
- **Context Engine → engines/context/README.md**
- Deployment details → AI-LAYER-TECHNICAL-SPEC.md
- Template reference → ENGINE-SPEC-TEMPLATE.md