---
name: n8n-workflows
description: This skill MUST be used when working with n8n-mcp tools, creating n8n workflows, modifying existing workflows, validating workflow JSON, troubleshooting n8n errors, or when the user mentions "workflow", "n8n", "n8n-mcp", "schedule trigger", "webhook workflow". Auto-triggers on any mcp__n8n-mcp__ tool call.
version: 1.0.0
---

# n8n Workflow Development Rules

**MANDATORY:** Follow these rules EXACTLY when using any n8n-mcp tool. Violations cause workflow failures.

## Critical Rules (BLOCK = Stop Immediately)

| ID | Rule | Enforcement |
|----|------|-------------|
| N8N-001 | NEVER modify working workflow JSON directly | BLOCK |
| N8N-002 | ALWAYS validate before deploy | BLOCK |
| N8N-003 | Template search BEFORE building from scratch | WARN |
| N8N-004 | `get_node` with `detail='standard'` BEFORE using any node | BLOCK |
| N8N-005 | NEVER trust default parameter values | BLOCK |
| N8N-006 | All node types MUST use full package prefix | BLOCK |
| N8N-007 | Document working configs in sticky notes | WARN |

## Mandatory Workflow (Follow Exactly)

```
PHASE 1: DISCOVERY
├── 1. tools_documentation()           # Load best practices
├── 2. search_templates(by_task: "...")  # Check if template exists
└── 3. IF template found → get_template() → PHASE 4

PHASE 2: NODE RESEARCH
├── 4. search_nodes(query, includeExamples: true)
├── 5. get_node(nodeType, detail: 'standard', includeExamples: true)
└── 6. Note ALL required parameters (NEVER trust defaults)

PHASE 3: VALIDATION CASCADE
├── 7. validate_node(mode: 'minimal')     # Quick check
├── 8. validate_node(mode: 'full')        # Complete validation
└── 9. Fix ALL errors before proceeding

PHASE 4: BUILD
├── 10. Build workflow with ALL parameters explicit
├── 11. validate_workflow(workflowJson)   # Full workflow check
└── 12. n8n_create_workflow OR n8n_update_partial_workflow

PHASE 5: VERIFY
├── 13. n8n_validate_workflow({id})       # Post-deploy validation
├── 14. n8n_test_workflow({id})           # Execution test
└── 15. Add documentation sticky notes
```

## Node Type Prefixes (N8N-006)

**ALWAYS use full package prefix. Short names WILL FAIL.**

```yaml
# CORE NODES - prefix: n8n-nodes-base
core:
  - n8n-nodes-base.webhook        # NOT "webhook"
  - n8n-nodes-base.httpRequest    # NOT "httpRequest"
  - n8n-nodes-base.code           # NOT "code"
  - n8n-nodes-base.if             # NOT "if"
  - n8n-nodes-base.set            # NOT "set"
  - n8n-nodes-base.scheduleTrigger  # NOT "schedule"
  - n8n-nodes-base.errorTrigger   # NOT "errorTrigger"
  - n8n-nodes-base.slack
  - n8n-nodes-base.postgres
  - n8n-nodes-base.supabase

# AI/LANGCHAIN NODES - prefix: @n8n/n8n-nodes-langchain
langchain:
  - "@n8n/n8n-nodes-langchain.agent"
  - "@n8n/n8n-nodes-langchain.lmChatOpenAi"
  - "@n8n/n8n-nodes-langchain.memoryBufferWindow"
  - "@n8n/n8n-nodes-langchain.vectorStorePinecone"
```

## Project Naming Convention

```yaml
format: "smartout-rag-[TRIGGER]-[ACTION]-[TARGET]"

examples:
  valid:
    - smartout-rag-webhook-process-document
    - smartout-rag-schedule-sync-users
    - smartout-rag-event-trigger-nudge
  invalid:
    - my_workflow           # Missing prefix
    - test123               # No structure
    - webhook-process       # Missing smartout-rag prefix
```

## Required Workflow Structure

Every workflow MUST have:

```yaml
structure:
  - trigger_node: Clear entry point (Webhook, Schedule, Manual)
  - error_handling: Branch with error logging
  - respond_to_webhook: Required if webhook-triggered
  - sticky_notes: Header (green), Input (blue), Process (yellow), Output (purple), Error (pink)
  - tags: Appropriate labels (smartout-rag, domain)
```

## Sticky Note Colors

| Type | Color ID | Purpose |
|------|----------|---------|
| Header | 4 (green) | Metadata, purpose, credentials |
| Input | 2 (blue) | Expected JSON, validation |
| Processing | 1 (yellow) | Steps, dependencies |
| Output | 5 (purple) | Success/error responses |
| Error | 3 (pink) | Error handling flow |

## Connection Syntax (CORRECT FORMAT)

```json
// CORRECT - Parameter format
{
  "type": "addConnection",
  "source": "Node A",
  "target": "Node B",
  "sourceOutput": "main",
  "targetInput": "main"
}

// IF Node branches
{
  "type": "addConnection",
  "source": "IF",
  "target": "Success Handler",
  "branch": "true"
}
```

**NEVER use object format:**
```json
// WRONG - Object format (WILL FAIL)
{
  "type": "addConnection",
  "connection": { "source": {...}, "destination": {...} }
}
```

## Expression Syntax

```javascript
// ALWAYS wrap in {{ }}
{{ $json.field }}                    // Current item
{{ $json.nested?.field }}            // Optional chaining
{{ $('NodeName').item.json.field }}  // Reference other node

// Code node MUST return array
return [{ json: { field: value } }];
```

## Error Prevention Checklist

Before EVERY n8n-mcp tool call:

- [ ] Node type has full package prefix (n8n-nodes-base.X or @n8n/...)
- [ ] All required parameters explicitly set (used get_node to check)
- [ ] Workflow name follows smartout-rag-* convention
- [ ] All expressions use {{ }} wrappers
- [ ] Connection syntax uses parameter format
- [ ] validate_node called before building
- [ ] validate_workflow called before deploy

## Reference Files

For detailed templates and patterns, see:
- `references/validation-cascade.md` - Full validation procedures
- `references/node-json-templates.md` - Copy-paste node JSON
- `references/expression-syntax.md` - Expression reference
