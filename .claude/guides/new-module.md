# Guide: Creating a New Module

> **Purpose:** Step-by-step instructions for adding a new module to the AI Layer.  
> **Audience:** Product owners, developers  
> **Time:** 1-2 hours for initial setup

---

## Prerequisites

Before starting, ensure you have:

- [ ] Read [AI Layer Architecture](./AI-LAYER-ARCHITECTURE.md)
- [ ] Read [AI Layer PRD](./AI-LAYER-PRD.md) – module vs engine distinction
- [ ] Read [Context Engine Spec](../engines/context/README.md) – **required**
- [ ] Identified which engines the module will use
- [ ] User stories or requirements

---

## Understanding Modules

### Module vs Engine vs Adapter

| If it... | It's a... |
|----------|-----------|
| Combines engines to deliver a product feature | **Module** ✅ |
| Has dedicated schema and core computation | Engine |
| Connects to external system | Adapter |

### Examples

| Module | Engines Used | Purpose |
|--------|--------------|---------|
| Compliance | Learning, Operation, Journey, Knowledge, **Context** | Certifications and audits |
| Onboarding | Journey, Learning, Communication, **Context** | New employee flow |
| Scheduling | Operation, Context, Communication, **Context** | Shift management |
| Handoff | Operation, Communication, **Context** | End-of-shift check-ins |

**Note:** Every module uses the Context Engine. It's not optional.

---

## Step 1: Define the Module

### 1.1 Answer Key Questions

Before creating, answer:

1. **What problem does this solve?**
2. **Who uses it?** (roles)
3. **Which engines does it need?** (Context is always included)
4. **What features does it include?**
5. **How is it activated?** (feature flag, config)

### 1.2 Create Module Spec

Copy the template:

```bash
mkdir -p modules/{module-name}/features
cp docs/templates/MODULE-TEMPLATE.md modules/{module-name}/README.md
```

Fill in all sections of the README.

**Do not proceed until the spec is reviewed.**

---

## Step 2: Define Context Requirements

> **This step is mandatory.** Every module must declare its context dependencies.

### 2.1 Determine Primary Mode

Which mode does this module primarily operate in?

| Mode | When to Choose |
|------|----------------|
| `business` | Work-related features, scheduling, payroll, compliance |
| `private` | Personal life features, personal goals, home |
| `hobby` | Learning, side projects, interests |

Most modules are `business` mode. Document any secondary modes.

### 2.2 List Domains Touched

Which system domains does this module read from or write to?

| Domain | Typical Access |
|--------|---------------|
| shifts | Read/Write for scheduling modules |
| training | Read/Write for learning modules |
| context | Read (always), Write (if producing attributes) |
| knowledge | Read for RAG-enabled features |

### 2.3 Identify Required Attributes

What attributes must an entity have for this module to function?

Example for a Wine Service module:
```markdown
| Attribute | Required Level | Purpose | Fallback |
|-----------|----------------|---------|----------|
| wine_knowledge | >= 2 | Can discuss wine | Show basic menu only |
| food_safety | true (boolean) | Legal requirement | Block from service |
```

### 2.4 Identify Produced Attributes

Does this module create new attributes? Document them:

```markdown
| Attribute | When Created | Source Type | Description |
|-----------|--------------|-------------|-------------|
| wine_knowledge | Quiz completed | quiz | Wine service capability |
| closing_certified | Training completed | cert | Can close restaurant |
```

### 2.5 Define Boosters & Blockers

Default situational adjustments for this module:

**Boosters:**
```markdown
| Attribute | Condition | Multiplier | Rationale |
|-----------|-----------|------------|-----------|
| wine_knowledge | situation: wine_service | ×2.0 | Wine expertise matters more during wine service |
```

**Blockers:**
```markdown
| Attribute | Condition | Rationale |
|-----------|-----------|-----------|
| wine_knowledge | situation: kitchen_prep | Wine expertise irrelevant in kitchen |
```

### 2.6 Set Depth Requirements

| Feature | Default Depth | Deep When |
|---------|---------------|-----------|
| Quick lookup | overview | Never |
| Standard operation | standard | Complex query |
| Detailed analysis | deep | Always |

---

## Step 3: Map to Engines

### 3.1 List Engine Dependencies

Create a table showing exactly what the module needs from each engine:

| Engine | What Module Needs | Tools/Events |
|--------|-------------------|--------------|
| **Context** | Mode, attributes, relevance | `context_get_context`, `context_set_attribute` |
| Journey | Enrollment, progress | `journey_enroll_worker` |
| Communication | Send notifications | `comm_send_message` |

**Context Engine is always first.** It provides the foundation.

### 3.2 Verify Engines Exist

For each engine:
- [ ] Engine exists and is deployed
- [ ] Required tools are available
- [ ] Events are being emitted

If an engine is missing required functionality, that's a separate task.

---

## Step 4: Define Features

### 4.1 List Features

Break the module into features:

| Feature | Priority | Description |
|---------|----------|-------------|
| {Feature 1} | Must Have | {Description} |
| {Feature 2} | Must Have | {Description} |
| {Feature 3} | Should Have | {Description} |

### 4.2 Create Feature Specs

For each feature:

```bash
cp docs/templates/FEATURE-TEMPLATE.md modules/{module-name}/features/{feature-name}.md
```

**Each feature must include its own Context Requirements section.**

---

## Step 5: Configure Activation

### 5.1 Feature Flag

Modules are activated via feature flags.

Add to `sys.feature_flag`:

```sql
INSERT INTO sys.feature_flag (
    workspace_id,
    flag_name,
    enabled,
    config
) VALUES (
    '{workspace_id}',
    'module_{module_name}',
    false,
    '{"version": "1.0.0"}'
);
```

### 5.2 Register Attribute Definitions

If the module introduces new attributes, register them:

```sql
INSERT INTO context.attribute_definitions (
    workspace_id,
    code,
    name,
    description,
    default_boosters,
    default_blockers
) VALUES (
    '{workspace_id}',
    'wine_knowledge',
    'Wine Knowledge',
    'Expertise in wine selection and service',
    '[{"condition": {"situation": "wine_service"}, "multiplier": 2.0}]',
    '[{"condition": {"situation": "kitchen_prep"}}]'
);
```

### 5.3 Module Configuration

If the module has configuration options, add to `sys.config`:

```sql
INSERT INTO sys.config (
    workspace_id,
    key,
    value
) VALUES (
    '{workspace_id}',
    'module.{module_name}.settings',
    '{
        "option1": true,
        "primary_mode": "business"
    }'
);
```

---

## Step 6: Define Events

### 6.1 Events to Emit

List events the module emits:

| Event | Trigger | Purpose |
|-------|---------|---------|
| `{module}.{action}.started` | User starts action | Track progress |
| `{module}.{action}.completed` | Action completes | Trigger follow-ups |

### 6.2 Events to Consume

List events the module listens to:

| Event | Source | Action |
|-------|--------|--------|
| `context.mode.changed` | Context | Adjust module behavior for new mode |
| `context.attribute.earned` | Context | Update UI, unlock features |
| `core.shift.created` | Core | Check if module should activate |

**Always listen to `context.mode.changed`** if the module behaves differently per mode.

---

## Step 7: Create Workflows (n8n)

Most module logic lives in n8n workflows, not custom code.

### 7.1 Identify Workflows Needed

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `{module}-activation` | Feature flag enabled | Initialize module, register attributes |
| `{module}-context-sync` | `context.mode.changed` | React to mode changes |
| `{module}-daily` | Cron (daily) | Daily operations |
| `{module}-event-handler` | Event subscription | React to events |

### 7.2 Context-Aware Workflow Pattern

Every workflow should get context first:

```javascript
// In n8n Function node - ALWAYS START WITH CONTEXT
const contextResponse = await $mcp.call('context_get_context', {
    workspace_id: $input.item.json.workspace_id,
    profile_id: $input.item.json.profile_id,
    query: 'module operation context',
    depth: 'standard'
});

const context = contextResponse.context;
const mode = context.mode;
const attributes = context.attributes;

// Now use context for decisions
if (mode !== 'business') {
    return { skip: true, reason: 'Not in business mode' };
}

// Check required attributes
const wineKnowledge = attributes.find(a => a.code === 'wine_knowledge');
if (!wineKnowledge || wineKnowledge.level < 2) {
    return { fallback: true, reason: 'Insufficient wine knowledge' };
}

// Proceed with context-aware logic
```

### 7.3 Document Workflows

Add workflow IDs to module README:

```markdown
## Workflows

| Workflow | ID | Trigger | Context Usage |
|----------|----|---------|---------------|
| {module}-activation | wf_123 | Manual | Registers attributes |
| {module}-context-sync | wf_124 | context.mode.changed | Updates module state |
| {module}-daily | wf_456 | Cron 6:00 | Gets context per worker |
```

---

## Step 8: Handle Extensions

If the module behaves differently for different industries:

### 8.1 Define Extension Behavior

| Extension | Customization | Context Differences |
|-----------|---------------|---------------------|
| Restaurant | Wine service, kitchen | Wine attributes boosted |
| Retail | Sales tracking | Sales attributes boosted |
| Healthcare | Patient care | Compliance attributes boosted |

### 8.2 Extension-Specific Boosters

Register extension-specific boosters:

```sql
-- Restaurant extension: boost wine attributes
INSERT INTO context.attribute_definitions (
    workspace_id,
    code,
    default_boosters
) VALUES (
    '{restaurant_workspace_id}',
    'wine_knowledge',
    '[
        {"condition": {"situation": "wine_service"}, "multiplier": 2.0},
        {"condition": {"temporal": "friday_evening"}, "multiplier": 1.5}
    ]'
);
```

---

## Step 9: Test the Module

### 9.1 Context-Specific Test Cases

```markdown
## Test Checklist: {Module Name}

### Context Tests (REQUIRED)
- [ ] Module respects current mode
- [ ] Module handles mode transitions correctly
- [ ] Required attributes block correctly when missing
- [ ] Boosters amplify correctly
- [ ] Blockers suppress correctly
- [ ] Fallback behavior works when context unavailable

### Activation
- [ ] Enable feature flag
- [ ] Attribute definitions registered
- [ ] Module initializes correctly

### Core Flow
- [ ] Primary user story works with correct context
- [ ] Secondary stories work
- [ ] Edge cases handled

### Events
- [ ] Events emit correctly
- [ ] Reacts to context.mode.changed
- [ ] Reacts to attribute changes
```

### 9.2 Automated Testing

Add integration tests:

```typescript
describe('{Module} Context Integration', () => {
    it('should respect mode', async () => {
        // Set mode to private
        await setMode(workspaceId, profileId, 'private');
        
        // Module should behave differently or skip
        const result = await moduleOperation();
        expect(result.skipped).toBe(true);
    });

    it('should apply boosters', async () => {
        // Set up wine_service situation
        await setContext({ situation: 'wine_service' });
        
        // Wine knowledge should be boosted
        const relevance = await getAttributeRelevance('wine_knowledge');
        expect(relevance).toBeGreaterThan(baseLevel * 1.5);
    });

    it('should respect blockers', async () => {
        // Set up blocked situation
        await setContext({ situation: 'kitchen_prep' });
        
        // Wine knowledge should be blocked
        const relevance = await getAttributeRelevance('wine_knowledge');
        expect(relevance).toBe(0);
    });
});
```

---

## Step 10: Document

### 10.1 Complete Module README

Ensure all sections filled, **especially Context Requirements**:

- [ ] Overview and value proposition
- [ ] Engines used (Context first)
- [ ] **Context Requirements (Section 3)** ← Critical
- [ ] Features listed
- [ ] User stories
- [ ] Activation instructions
- [ ] Events documented
- [ ] Workflows documented
- [ ] Success metrics

### 10.2 Create Feature Docs

For each feature:
- [ ] Feature spec complete
- [ ] **Context Requirements section filled**
- [ ] Acceptance criteria clear
- [ ] Engine mapping documented

### 10.3 Update AI Layer Docs

Add module to AI-LAYER-PRD.md modules section.

---

## Step 11: Rollout

### 11.1 Internal Testing

1. Enable for test workspace
2. Register all attribute definitions
3. Run through all test cases (especially context tests)
4. Fix issues

### 11.2 Beta

1. Enable for beta customers
2. Gather feedback on context relevance
3. Tune boosters/blockers based on feedback
4. Iterate

### 11.3 General Availability

1. Enable feature flag by default for new workspaces
2. Communicate to existing customers
3. Monitor metrics (especially context cache hit rate)

---

## Checklist

```markdown
Before marking module complete:

### Context (REQUIRED)
[ ] Primary mode identified
[ ] All modes documented (if multi-mode)
[ ] Domains listed with access types
[ ] Required attributes documented with fallbacks
[ ] Produced attributes documented with triggers
[ ] Attribute definitions registered in database
[ ] Boosters defined and registered
[ ] Blockers defined and registered
[ ] Depth requirements per feature documented
[ ] context.mode.changed event handled
[ ] Context-specific tests passing

### Standard
[ ] Module spec reviewed and approved
[ ] All features spec'd
[ ] Engine dependencies verified
[ ] Feature flag created
[ ] Events defined (emit and consume)
[ ] n8n workflows created and tested
[ ] Extensions handled
[ ] Manual testing passed
[ ] Documentation complete
[ ] Rollout plan defined
```

---

## File Structure

After completion:

```
modules/{module-name}/
├── README.md                  ← Module spec (with Context Requirements)
├── features/
│   ├── {feature-1}.md         ← Feature specs (with Context Requirements)
│   ├── {feature-2}.md
│   └── {feature-3}.md
├── context/
│   └── attributes.sql         ← Attribute definitions for this module
└── assets/
    ├── flow-diagram.md
    └── mockups/
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skipping Context Requirements | **Every module needs Section 3** |
| Not registering attributes | Add to `context.attribute_definitions` |
| Ignoring mode | Check mode before operations |
| No booster/blocker defaults | Define even if empty |
| Not listening to context events | Subscribe to `context.mode.changed` |
| Building custom code for context | Use Context Engine MCP tools |
| Hardcoding relevance logic | Use boosters/blockers |
| No fallback behavior | Define what happens when attributes missing |

---

## Need Help?

- Module vs Engine confusion → AI-LAYER-ARCHITECTURE.md
- Engine capabilities → AI-LAYER-PRD.md
- **Context system → engines/context/README.md**
- Module template → MODULE-TEMPLATE.md
- Feature template → FEATURE-TEMPLATE.md