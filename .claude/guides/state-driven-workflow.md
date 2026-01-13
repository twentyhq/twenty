# State-Driven Workflow Guide

How to maintain state and continuity across Claude Code sessions.

## The Problem

Claude Code is stateless between sessions. Each new session starts fresh with no memory of previous work.

## The Solution: File-Based State

Use files to persist state that Claude loads automatically:

### 1. Plan.md (Active Task State)

Create `Plan.md` in your working directory for current task:

```markdown
# Plan: Add user authentication

**Status:** In Progress

## Steps
- [x] 1. Create auth schema
- [x] 2. Add migration
- [ ] 3. Implement handlers
- [ ] 4. Create MCP tools
- [ ] 5. Add tests

## Progress Log
| Date | Step | Notes |
|------|------|-------|
| 2026-01-09 | 1-2 | Schema created, migration applied |

## Files Modified
- engines/auth/schema/001_create_auth.sql
- engines/auth/handlers/auth.handler.ts (WIP)
```

Claude will see this file and understand current progress.

### 2. Session Continuity

```bash
# Resume exactly where you left off
claude --continue

# Or pick a specific session
claude --resume
```

### 3. CLAUDE.md References

In your CLAUDE.md, reference the plan:

```markdown
## Current Work
See @Plan.md for active task status.
```

## Workflow Patterns

### Starting a Complex Task

```
1. Create Plan.md from template
2. Fill in objective and steps
3. Work through steps, checking off
4. Update progress log
5. End session naturally
```

### Resuming Work

```
1. Run: claude --continue
2. Claude reads Plan.md automatically
3. Say: "Continue with the plan"
4. Claude picks up where you left off
```

### Handing Off to Another Session

```
1. Update Plan.md progress log
2. Add handoff notes
3. Commit Plan.md to git (optional)
4. New session reads the state
```

## Decision Tracking

For decisions that need to persist:

```
docs/decisions/
├── 001-use-supabase.md
├── 002-mcp-tool-naming.md
└── 003-workspace-isolation.md
```

These become searchable history of why things are the way they are.

## Anti-Patterns

❌ **Don't:** Rely on verbal context alone
✅ **Do:** Write state to files

❌ **Don't:** Start fresh each session
✅ **Do:** Use `--continue` and Plan.md

❌ **Don't:** Make decisions without recording
✅ **Do:** Use decision records for significant choices

## Quick Reference

| Need | Solution |
|------|----------|
| Track active task | Plan.md |
| Resume session | `claude --continue` |
| Record decision | Decision record template |
| Share context with team | Commit Plan.md, decisions |
| Scope-specific rules | `.claude/rules/*.md` |