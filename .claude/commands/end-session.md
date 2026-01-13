# End Session

Perform comprehensive end-of-session cleanup and state synchronization.

## Overview

This command updates all state files, captures learnings, and ensures session continuity.
Run this before ending any significant work session.

## Checklist

Execute each section in order:

### 1. Decisions Update (.claude/decisions.yaml)

Review work done this session. For each significant decision made:

```yaml
- id: DEC-XXX  # Next sequential ID
  timestamp: {ISO8601}
  session: "{current_session_id}"
  plan: "{plan_id_if_any}"
  type: {architecture|implementation|trade_off|scope|proceed_without_docs}
  context: "What prompted this decision"
  decision: "What was decided"
  reason: "Why this choice"
  reversible: {true|false}
  user_impact: "Impact on end users (null if internal)"
```

Check for decisions from:
- [ ] Architecture changes
- [ ] Implementation choices
- [ ] Trade-offs made
- [ ] Scope changes

### 2. Pipeline Update (.claude/pipeline.yaml)

Move any completed plans to appropriate status:
- `in_progress` → `ready_for_test` (if code complete)
- `ready_for_test` → `ready_for_docs` (if tests pass)
- Remove from pipeline if moved to completed in workflow-state

Update `summary.by_status` counts.

### 3. Workflow State Update (.claude/workflow-state.yaml)

Update `current_session` block:

```yaml
current_session:
  id: "{session_id}"
  started: {start_time}
  ended: {now}
  plan: "{plan_name}"
  plan_path: "{path_to_plan}"
  status: {completed|stopped|blocked}
  current_step: {last_completed_step}
  skills_loaded: [list of skills used]
  last_checkpoint: {now}
  tasks_completed:
    - "Task 1"
    - "Task 2"
  tasks_remaining:
    - "Remaining task if any"
```

**If plan is DONE:**
Set plan status to `ready_for_test` in the plans section:
```yaml
plans:
  {plan_id}:
    status: ready_for_test
    ready_for_test_at: {now}
```

### 4. Engine Learnings (.claude/learnings/{engine}/)

For each engine touched this session:

**LEARNINGS.md** - Add new entries:
```markdown
### D-XXX: {Discovery Title}
**Found:** {date}
**Context:** What triggered the discovery
**Finding:** What was discovered
**Implication:** What this means for future work
**Status:** New
```

Categories:
- `D-XXX` - Discoveries (unexpected findings)
- `I-XXX` - Infrastructure (system architecture)
- `A-XXX` - Assumptions (needs validation)
- `E-XXX` - Edge Cases (boundary conditions)
- `AP-XXX` - Anti-patterns (what NOT to do)

**QUERIES.md** - Add useful queries:
```markdown
### Q-XXX: {Query Purpose}
**Use case:** When to use this query
**SQL:**
\`\`\`sql
SELECT ... FROM ...
\`\`\`
**Notes:** Any caveats
```

**STATUS.json** - Update sync status:
```json
{
  "last_sync": "{now}",
  "sync_status": "complete",
  "notes": "Session summary"
}
```

### 5. Learnings Index (.claude/learnings/INDEX.md)

Add entry to Recent Activity:
```markdown
| {date} | {agent} | {type} | {summary} |
```

Update Quick Stats if counts changed.

### 6. Log Checkpoint

Check `.claude/hooks.log` for:
- [ ] Any errors that need addressing
- [ ] Patterns that should become queries
- [ ] Warnings to investigate

### 7. Session History

Add session to `sessions:` array in workflow-state.yaml:
```yaml
- id: "{session_id}"
  started: {start_time}
  ended: {now}
  plan: "{plan_id}"
  docs_checked: [list]
  docs_created: [list]
  docs_updated: [list]
  learnings_captured: {count}
  outcome: "{SUCCESS|BLOCKED|STOPPED} - Summary"
```

## Verification

After updates, confirm:
- [ ] All YAML files parse correctly
- [ ] STATUS.json files are valid JSON
- [ ] No duplicate decision IDs
- [ ] Plan statuses are consistent between pipeline.yaml and workflow-state.yaml

## Arguments

$ARGUMENTS - Optional: Reason for ending session (e.g., "completed sprint 1", "blocked on API")

## Example Output

```
End Session Summary
-------------------
Session: 2026-01-12-session-journey-editor
Duration: 3h 45m
Plan: 2026-01-12-journey-editor-sprint1
Status: completed → ready_for_test

Updates Made:
- decisions.yaml: +2 decisions (DEC-015, DEC-016)
- workflow-state.yaml: Session archived, plan → ready_for_test
- pipeline.yaml: Moved to ready_for_test
- learnings/journey/: +1 discovery, +2 queries
- learnings/INDEX.md: Updated activity log

Next Steps:
- Run tests for journey-editor
- Review DEC-015, DEC-016 in decisions.yaml
```

## Notes

- This command is idempotent - safe to run multiple times
- If session had no plan, skip pipeline updates
- If no learnings captured, note this in STATUS.json
- Always update last_checkpoint even if nothing changed
