# Linear Workflow for Claude

This document describes how Claude interacts with Linear for task management.

## Label System

| Label | Meaning | When to Use |
|-------|---------|-------------|
| `claude-ready` | Ready for Claude to pick up | Human has prepared task with enough context |
| `claude-wip` | Claude is working on it | Claude has started work, adds 👀 comment |
| `claude-blocked` | Needs human input | Claude encountered a blocker |
| `claude-review` | Ready for human review | Claude completed work, needs verification |

## Comment Protocol

Claude follows the Linear Protocol (THE LAW) for all comments:

| Emoji | Type | When |
|-------|------|------|
| 👀 | Looking | Starting work, first impressions |
| 💭 | Thinking | Weighing options, trade-offs |
| 📋 | Plan | Breaking down into tasks |
| 📌 | Decision | Choice made + why |
| 💡 | Discovery | Learned something useful |
| 🎯 | Insight | Product value, selling point |
| 🚀 | Potential | "This could be big because..." |
| ⚠️ | Warning | Watch out, gotcha |
| 🚫 | Blocked | Stuck, need help |
| ❌ | Error | Failed, what happened |
| 🔥 | Critical | Urgent, needs attention now |
| ✅ | Done | Wrapped up, summary |

## Workflow

### Starting Work

1. Query for issues with `claude-ready` label
2. Pick highest priority, oldest first
3. Change label to `claude-wip`
4. Post 👀 Looking comment with first impressions
5. Begin implementation

### During Work

- Post 📌 Decision comments for significant choices
- Post 💡 Discovery comments when learning something useful
- Post 🚫 Blocked comment if stuck (change label to `claude-blocked`)

### Completing Work

1. Post ✅ Done comment with summary
2. Change label to `claude-review`
3. Link to PR if applicable

## Epic Structure

Epics in Linear map to major features or modules:

| Epic Type | Example | Codebase Location |
|-----------|---------|-------------------|
| Frontend Feature | "Dark Mode" | `packages/twenty-front/src/modules/` |
| Backend Feature | "API Caching" | `packages/twenty-server/src/engine/` |
| Infrastructure | "CI/CD Pipeline" | `.github/workflows/` |
| Documentation | "API Docs" | `docs/` |

## MCP Integration

Linear is accessed via MCP server configured in `.mcp.json`:

```json
{
  "linear": {
    "command": "cmd",
    "args": ["/c", "npx", "-y", "@anthropic-ai/mcp-remote@latest", "https://mcp.linear.app/sse"]
  }
}
```

### Available Tools

- `list_issues` - Query issues with filters
- `get_issue` - Get issue details
- `create_issue` - Create new issues
- `update_issue` - Update issue status/labels
- `create_comment` - Add comments
- `list_projects` - List projects/epics

## Session Start Checklist

When starting a new Claude session:

1. [ ] Check Linear for `claude-ready` issues
2. [ ] Review any `claude-blocked` issues for resolution
3. [ ] Check `claude-wip` for any stale work from previous sessions
