# n8n Validation Cascade

## 5-Level Validation Hierarchy

Execute validations in order. Stop at first failure.

```
Level 1: STRUCTURE (blocks tool use)
    ↓
Level 2: NAMING (blocks tool use)
    ↓
Level 3: CONNECTIONS (must verify before changes)
    ↓
Level 4: EXPRESSIONS (test required)
    ↓
Level 5: RUNTIME (manual test)
```

---

## Level 1: Structure Validation

**Purpose:** Ensure valid JSON structure

**Checks:**
- [ ] Valid JSON syntax (parseable)
- [ ] Has `nodes` array
- [ ] Has `connections` object
- [ ] Each node has required properties: `id`, `name`, `type`, `position`, `parameters`

**Failure Response:** BLOCK - Cannot proceed with invalid structure

```javascript
// Required node structure
{
  "id": "unique-id",
  "name": "Node Name",
  "type": "n8n-nodes-base.type",
  "position": [x, y],
  "parameters": {}
}
```

---

## Level 2: Naming Validation

**Purpose:** Ensure consistent naming conventions

**Checks:**
- [ ] Workflow name follows pattern: `smartout-{rag|ai|pub}-[TRIGGER]-[ACTION]-[TARGET]`
- [ ] Node names are descriptive (not "HTTP Request", but "Fetch User Data")
- [ ] No duplicate node names
- [ ] Credential names use snake_case

**Failure Response:** BLOCK - Fix naming before proceeding

**Valid Workflow Names:**
```
smartout-rag-webhook-process-documents
smartout-ai-schedule-sync-embeddings
smartout-pub-manual-publish-content
```

**Valid Node Names:**
```
Fetch User Profile          ✓
HTTP Request               ✗ (too generic)
Process API Response       ✓
Code                       ✗ (too generic)
```

---

## Level 3: Connection Validation

**Purpose:** Ensure valid node connections

**Checks:**
- [ ] All connections reference existing nodes (by name)
- [ ] Connection types match node capabilities (`main`, `ai_languageModel`, `ai_memory`, etc.)
- [ ] No orphaned nodes (except triggers)
- [ ] Trigger nodes have no inputs
- [ ] Output nodes have no outputs

**Failure Response:** MUST verify connections before making changes

**Connection Structure:**
```json
"connections": {
  "Source Node Name": {
    "main": [[{
      "node": "Target Node Name",
      "type": "main",
      "index": 0
    }]]
  }
}
```

**AI Node Connections:**
```json
"connections": {
  "OpenAI Chat Model": {
    "ai_languageModel": [[{
      "node": "AI Agent",
      "type": "ai_languageModel",
      "index": 0
    }]]
  }
}
```

---

## Level 4: Expression Validation

**Purpose:** Ensure valid n8n expressions

**Checks:**
- [ ] All expressions wrapped in `{{ }}`
- [ ] No trailing periods in expressions
- [ ] Node references use exact names `$('Node Name')`
- [ ] Optional chaining for nested access
- [ ] Code nodes return proper format

**Failure Response:** Test expressions before deployment

**Common Expression Errors:**
```javascript
// WRONG - trailing period
{{ $json.user. }}

// CORRECT
{{ $json.user }}

// WRONG - no brackets
$json.email

// CORRECT
{{ $json.email }}

// WRONG - no json wrapper in Code node
return { data: value };

// CORRECT
return [{ json: { data: value } }];
```

---

## Level 5: Runtime Validation

**Purpose:** Verify workflow execution

**Checks:**
- [ ] Test execution completes without error
- [ ] Expected output produced
- [ ] Error paths handled
- [ ] Timeouts configured appropriately
- [ ] Webhook responds correctly

**Failure Response:** Manual testing required

**Test Commands:**
```bash
# List recent executions
curl -X POST localhost:3101/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"method":"tools/call","params":{"name":"n8n_executions","arguments":{"action":"list","limit":5}}}'

# Test webhook
curl -X POST localhost:5678/webhook/your-path \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## Validation Checklist Template

Use this before any n8n-mcp tool call:

```markdown
## Pre-Tool Validation
- [ ] L1: JSON structure valid
- [ ] L2: Naming conventions followed
- [ ] L3: Connections verified
- [ ] L4: Expressions tested
- [ ] L5: Runtime behavior confirmed

## Tool Call Details
- Tool: n8n_update_partial_workflow
- Workflow ID: xxx
- Operation: updateNode
- Node: "Node Name"
- Changes: [describe]

## Rollback Plan
- Previous JSON saved: yes/no
- Revert command ready: yes/no
```

---

## Quick Reference

| Level | What | When Fails |
|-------|------|------------|
| 1-Structure | Valid JSON | BLOCK |
| 2-Naming | Conventions | BLOCK |
| 3-Connections | Node links | VERIFY FIRST |
| 4-Expressions | Syntax | TEST |
| 5-Runtime | Execution | MANUAL TEST |
