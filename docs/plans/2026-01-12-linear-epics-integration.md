# Linear Epics Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish working Linear MCP connection and query epics/projects for task management.

**Architecture:** Use the Linear MCP server (already configured) to authenticate via OAuth and query the Linear API for epics, projects, and issues with specific labels.

**Tech Stack:** Linear MCP, @anthropic-ai/mcp-remote, Claude Code

---

## Current State

- Linear MCP is configured in `.mcp.json`
- Server appears as `linear-server` in available servers list
- OAuth authentication may be required

## Task 1: Verify Linear MCP Connection

**Files:**
- Check: `.mcp.json` (already verified)
- Check: MCP server list

**Step 1: List available MCP servers**

Run in Claude Code: Check ListMcpResourcesTool for available servers

Expected: See `linear-server` or `linear` in list

**Step 2: Test Linear server resource listing**

```
ListMcpResourcesTool(server: "linear-server")
```

Expected: Either resources list OR authentication prompt

**Step 3: Document findings**

If authentication needed, note the OAuth URL. If working, proceed to Task 2.

---

## Task 2: Authenticate with Linear (if needed)

**Step 1: Check if OAuth is required**

The Linear MCP uses SSE endpoint `https://mcp.linear.app/sse` which requires OAuth.

**Step 2: Trigger authentication flow**

When first connecting, Linear MCP should provide an OAuth URL. Open this in browser and authorize.

**Step 3: Verify authentication**

After OAuth, retry:
```
ListMcpResourcesTool(server: "linear-server")
```

Expected: Resources now available

---

## Task 3: Query Linear for Epics/Projects

**Step 1: List available projects**

Use Linear MCP tool:
```
mcp__linear__list_projects()
```

Expected: List of projects with IDs and names

**Step 2: Get project details**

For each project of interest:
```
mcp__linear__get_project(id: "PROJECT_ID")
```

Expected: Project details including issues, status, timeline

**Step 3: List issues with labels**

Query for Claude-ready issues:
```
mcp__linear__list_issues(filter: { labels: ["claude-ready"] })
```

Expected: Issues ready for Claude to pick up

---

## Task 4: Document Linear Workflow

**Files:**
- Create: `docs/linear-workflow.md`

**Step 1: Document label system**

```markdown
## Linear Labels for Claude

| Label | Meaning |
|-------|---------|
| `claude-ready` | Ready for Claude to pick up |
| `claude-wip` | Claude is working on it |
| `claude-blocked` | Needs human input |
| `claude-review` | Ready for human review |
```

**Step 2: Document epic structure**

Document how epics map to features/modules in the codebase.

**Step 3: Commit documentation**

```bash
git add docs/linear-workflow.md
git commit -m "docs: add Linear workflow documentation"
```

---

## Success Criteria

- [ ] Linear MCP connection verified
- [ ] OAuth authentication completed (if needed)
- [ ] Can list projects/epics from Linear
- [ ] Can query issues by label
- [ ] Workflow documented

## Troubleshooting

### "Server not found"
- Check `.mcp.json` configuration
- Restart Claude Code to refresh MCP connections
- Server may be named `linear-server` instead of `linear`

### "Authentication required"
- OAuth flow needs browser interaction
- Check Linear account permissions
- Verify API key scope if using key-based auth

### "No issues found"
- Check label spelling (case-sensitive)
- Verify issues exist with those labels
- Check project/team filtering
