# Claude Code Component Selection Guide

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Define when to use MCP tools, skills, hooks, commands, and agents in Claude Code development within the AI Layer project.

**Architecture:** Claude Code plugins consist of 5 component types, each solving different needs. This guide provides decision criteria, implementation patterns, and step-by-step workflows.

**Tech Stack:** Claude Code, Markdown, YAML frontmatter, JSON, Bash scripts, TypeScript, Bun, Supabase

**Skills Used:** hook-development, working-with-claude-code, mcp-integration, command-development, agent-development, work-with-ai-layer

**Skill Index:** Consult `@.claude/skills/SKILL-LIST.md` for each task to identify additional skills to invoke.

**Superpowers Rule:** If even 1% chance a skill applies, INVOKE IT before proceeding.

---

## Component Decision Tree

```
User Need
    │
    ├─ "I need to connect to external services/APIs"
    │   └─→ MCP Server (use mcp-integration skill)
    │
    ├─ "I need to validate/intercept Claude's actions"
    │   └─→ Hook (use hook-development skill)
    │
    ├─ "I need reusable user-invoked workflows"
    │   └─→ Command (use command-development skill)
    │
    ├─ "I need autonomous multi-step task execution"
    │   └─→ Agent (use agent-development skill)
    │
    └─ "I need Claude to have specialized domain knowledge"
        └─→ Skill (create in skills/ directory)
```

---

## Component Comparison

| Component | Trigger | Purpose | Context Load | User Facing |
|-----------|---------|---------|--------------|-------------|
| **MCP Server** | Tool call | External service integration | Tools always visible | No |
| **Hook** | Event (PreToolUse, Stop, etc.) | Validation, automation, context injection | On event | No |
| **Command** | `/command-name` | User-initiated workflows | On invocation | Yes |
| **Agent** | Task delegation | Autonomous complex tasks | On delegation | No |
| **Skill** | Context match | Domain expertise, procedures | On trigger | No |

---

## Plugin Directory Structure

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Required: Plugin manifest
├── commands/                 # Slash commands (.md files)
│   └── hello.md             # → /hello command
├── agents/                   # Subagent definitions (.md files)
│   └── reviewer.md
├── skills/                   # Agent skills (subdirectories)
│   └── my-skill/
│       └── SKILL.md         # Required for each skill
├── hooks/
│   └── hooks.json           # Event handler configuration
├── .mcp.json                # MCP server definitions
└── scripts/                 # Helper scripts
```

**Critical rules:**
- Manifest MUST be in `.claude-plugin/plugin.json`
- Component directories at plugin root, NOT inside `.claude-plugin/`
- Use `${CLAUDE_PLUGIN_ROOT}` for portable paths

---

## Task 1: Hooks

**Files:**
- Create: `hooks/hooks.json`
- Scripts: `hooks/scripts/*.sh`
- Reference: `.claude/skills/hook-development/SKILL.md`

### Hook Events Reference

| Event | When | Use For | Matcher Required |
|-------|------|---------|------------------|
| `PreToolUse` | Before tool | Validation, modification, blocking | Yes |
| `PostToolUse` | After tool | Feedback, logging, quality checks | Yes |
| `UserPromptSubmit` | User input | Context injection, validation | No |
| `Stop` | Agent stopping | Completeness verification | No |
| `SubagentStop` | Subagent done | Task validation | No |
| `SessionStart` | Session begins | Context loading, env setup | Yes (startup/resume/clear/compact) |
| `SessionEnd` | Session ends | Cleanup, logging | No |
| `PreCompact` | Before compact | Preserve critical context | Yes (manual/auto) |
| `Notification` | User notified | Logging, reactions | No |

### Hook Configuration Format

**Plugin hooks.json (with wrapper):**
```json
{
  "description": "Brief explanation (optional)",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/validate.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

**Settings format (direct, no wrapper):**
```json
{
  "hooks": {
    "PreToolUse": [...],
    "Stop": [...]
  }
}
```

### Hook Types

**Prompt-Based (Recommended):**
```json
{
  "type": "prompt",
  "prompt": "Validate this operation: $TOOL_INPUT. Return 'approve' or 'deny'.",
  "timeout": 30
}
```
- Supported: Stop, SubagentStop, UserPromptSubmit, PreToolUse
- Benefits: Context-aware, flexible, easier to maintain

**Command-Based:**
```json
{
  "type": "command",
  "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh",
  "timeout": 60
}
```
- Benefits: Deterministic, fast, external tool integration

### Hook Output Formats

**Simple (Exit Codes):**
- Exit 0: Success (stdout shown in transcript)
- Exit 2: Blocking error (stderr fed to Claude)
- Other: Non-blocking error

**Advanced (JSON):**
```json
{
  "continue": true,
  "suppressOutput": false,
  "systemMessage": "Message for Claude",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "Explanation"
  }
}
```

### Common Hook Patterns

**Pattern 1: Security Validation (PreToolUse)**
```json
{
  "PreToolUse": [{
    "matcher": "Write|Edit",
    "hooks": [{
      "type": "prompt",
      "prompt": "File path: $TOOL_INPUT.file_path. Verify: 1) Not system directory 2) Not .env or credentials 3) No path traversal. Return 'approve' or 'deny'."
    }]
  }]
}
```

**Pattern 2: Test Enforcement (Stop)**
```json
{
  "Stop": [{
    "matcher": "*",
    "hooks": [{
      "type": "prompt",
      "prompt": "Review transcript. If code was modified, verify tests were executed. If not, block with reason 'Tests must be run after code changes'."
    }]
  }]
}
```

**Pattern 3: Context Loading (SessionStart)**
```json
{
  "SessionStart": [{
    "matcher": "*",
    "hooks": [{
      "type": "command",
      "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/load-context.sh"
    }]
  }]
}
```

**Pattern 4: MCP Tool Monitoring**
```json
{
  "PreToolUse": [{
    "matcher": "mcp__.*__delete.*",
    "hooks": [{
      "type": "prompt",
      "prompt": "Deletion operation detected. Is this intentional? Can it be undone? Return 'approve' only if safe."
    }]
  }]
}
```

**Pattern 5: Build Verification (Stop)**
```json
{
  "Stop": [{
    "matcher": "*",
    "hooks": [{
      "type": "prompt",
      "prompt": "Check if Write/Edit tools were used. If so, verify project was built. If not built, block and request build."
    }]
  }]
}
```

### Hook Script Template

```bash
#!/bin/bash
set -euo pipefail

# Read JSON input
input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name')
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Validate path traversal
if [[ "$file_path" == *".."* ]]; then
  echo '{"hookSpecificOutput":{"permissionDecision":"deny","permissionDecisionReason":"Path traversal detected"}}' >&2
  exit 2
fi

# Validate sensitive files
if [[ "$file_path" == *".env"* ]]; then
  echo '{"hookSpecificOutput":{"permissionDecision":"deny","permissionDecisionReason":"Sensitive file"}}' >&2
  exit 2
fi

# Approve
exit 0
```

### Environment Variables

- `$CLAUDE_PROJECT_DIR` - Project root path
- `$CLAUDE_PLUGIN_ROOT` - Plugin directory (use for portability)
- `$CLAUDE_ENV_FILE` - SessionStart only: persist env vars here

### Step-by-Step Hook Implementation

**Step 1:** Identify event to hook (PreToolUse, Stop, SessionStart, etc.)

**Step 2:** Choose hook type (prompt for complex reasoning, command for deterministic)

**Step 3:** Create `hooks/hooks.json` with wrapper format

**Step 4:** For command hooks, create scripts in `hooks/scripts/`

**Step 5:** Use `${CLAUDE_PLUGIN_ROOT}` for all file references

**Step 6:** Test with `claude --debug`

**Step 7:** Use `/hooks` command to verify registration

---

## Task 2: MCP Servers

**Files:**
- Create: `.mcp.json` (plugin root)
- Reference: `.claude/skills/mcp-integration/SKILL.md`

### When to Use MCP

Use MCP servers when you need to:
- Connect to external APIs (GitHub, Asana, databases)
- Provide 10+ related tools from a single service
- Handle OAuth or complex authentication
- Integrate third-party services

### MCP Server Types

| Type | Transport | Best For | Auth |
|------|-----------|----------|------|
| `stdio` | Process | Local tools, custom servers | Env vars |
| `SSE` | HTTP | Hosted services, cloud APIs | OAuth |
| `HTTP` | REST | API backends, token auth | Headers |
| `ws` | WebSocket | Real-time, streaming | Headers |

### Configuration Examples

**stdio (Local Process):**
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"],
    "env": {
      "LOG_LEVEL": "debug"
    }
  }
}
```

**SSE (Hosted Service):**
```json
{
  "asana": {
    "type": "sse",
    "url": "https://mcp.asana.com/sse"
  }
}
```

**HTTP (REST API):**
```json
{
  "api-service": {
    "type": "http",
    "url": "https://api.example.com/mcp",
    "headers": {
      "Authorization": "Bearer ${API_TOKEN}"
    }
  }
}
```

### MCP Tool Naming

Format: `mcp__plugin_<plugin-name>_<server-name>__<tool-name>`

Example: `mcp__plugin_asana_asana__asana_create_task`

### Step-by-Step MCP Implementation

**Step 1:** Choose server type (stdio, SSE, HTTP, ws)

**Step 2:** Create `.mcp.json` at plugin root

**Step 3:** Use `${CLAUDE_PLUGIN_ROOT}` for local server paths

**Step 4:** Document required environment variables in README

**Step 5:** Test with `/mcp` command

**Step 6:** Pre-allow specific MCP tools in commands

---

## Task 3: Commands

**Files:**
- Create: `commands/command-name.md`
- Reference: `.claude/skills/command-development/SKILL.md`

### Command Structure

```markdown
---
description: Brief description for /help
allowed-tools: Read, Write, Bash(git:*)
argument-hint: [file-path] [options]
model: inherit
---

Instructions for Claude...
```

### Critical: Commands are FOR Claude

Commands are instructions FOR Claude, not messages TO users:

**Correct:**
```markdown
Review @$1 for security vulnerabilities including:
- SQL injection
- XSS attacks
- Authentication issues
```

**Incorrect:**
```markdown
This command will review your code for security issues.
```

### Dynamic Features

- `$ARGUMENTS` - All arguments as string
- `$1`, `$2`, `$3` - Positional arguments
- `@file` - File references
- `!`command`` - Bash execution

### Step-by-Step Command Implementation

**Step 1:** Define command purpose (single responsibility)

**Step 2:** Create `commands/name.md` with frontmatter

**Step 3:** Write instructions as directives TO Claude

**Step 4:** Add dynamic features ($ARGUMENTS, @file)

**Step 5:** Test with `/command-name`

---

## Task 4: Agents

**Files:**
- Create: `agents/agent-name.md`
- Reference: `.claude/skills/agent-development/SKILL.md`

### Agent Structure

```markdown
---
name: agent-identifier
description: Use this agent when [conditions]. Examples:
<example>
Context: [Scenario]
user: "[Request]"
assistant: "[Response]"
<commentary>Why this agent triggers</commentary>
</example>
model: inherit
color: blue
tools: ["Read", "Write", "Grep"]
---

You are [role] specializing in [domain].

**Core Responsibilities:**
1. [Responsibility]

**Process:**
1. [Step]

**Output Format:**
[What to provide]
```

### Frontmatter Fields

| Field | Required | Options |
|-------|----------|---------|
| `name` | Yes | 3-50 chars, lowercase, hyphens |
| `description` | Yes | Include examples with `<example>` |
| `model` | Yes | inherit, sonnet, opus, haiku |
| `color` | Yes | blue, cyan, green, yellow, magenta, red |
| `tools` | No | Array of tool names |

### Step-by-Step Agent Implementation

**Step 1:** Define agent purpose and triggering conditions

**Step 2:** Create `agents/name.md` with all required fields

**Step 3:** Include 2-4 `<example>` blocks in description

**Step 4:** Write system prompt with clear responsibilities

**Step 5:** Test triggering with similar phrases

---

## Task 5: Skills

**Files:**
- Create: `skills/skill-name/SKILL.md`
- Supporting: `references/`, `examples/`, `scripts/`

### Skill Structure

```markdown
---
name: Skill Name
description: This skill should be used when the user asks to "...", "...", or mentions ...
version: 0.1.0
---

## Overview
[Purpose and concepts]

## Process
[Workflow steps]

## Additional Resources
- `references/detailed-guide.md`
- `examples/working-example.sh`
```

### Progressive Disclosure

| Level | Contents | Load |
|-------|----------|------|
| Metadata | name + description | Always (~100 words) |
| SKILL.md | Core instructions | On trigger (<2k words) |
| References | Detailed docs | As needed |

---

## Plugin Testing Workflow

### Local Development Setup

```bash
# Create marketplace structure
mkdir dev-marketplace
cd dev-marketplace
mkdir my-plugin

# Create marketplace manifest
mkdir .claude-plugin
cat > .claude-plugin/marketplace.json << 'EOF'
{
  "name": "dev-marketplace",
  "owner": {"name": "Developer"},
  "plugins": [{
    "name": "my-plugin",
    "source": "./my-plugin",
    "description": "Plugin under development"
  }]
}
EOF
```

### Testing Cycle

```bash
# Add marketplace
/plugin marketplace add ./dev-marketplace

# Install plugin
/plugin install my-plugin@dev-marketplace

# Test components
/command-name
/hooks
/mcp

# Iterate
/plugin uninstall my-plugin@dev-marketplace
/plugin install my-plugin@dev-marketplace
```

### Debugging

```bash
# Enable debug mode
claude --debug

# Check hooks
/hooks

# Check MCP servers
/mcp

# Check commands
/help
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│         CLAUDE CODE COMPONENT SELECTION                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EXTERNAL SERVICE?     → MCP Server (.mcp.json)             │
│  EVENT VALIDATION?     → Hook (hooks/hooks.json)            │
│  USER WORKFLOW?        → Command (commands/*.md)            │
│  AUTONOMOUS TASK?      → Agent (agents/*.md)                │
│  DOMAIN KNOWLEDGE?     → Skill (skills/*/SKILL.md)          │
│                                                             │
│  HOOK EVENTS                                                │
│  PreToolUse    - Before tool (validate/block)               │
│  PostToolUse   - After tool (feedback/log)                  │
│  Stop          - Agent stopping (verify complete)           │
│  SessionStart  - Session begins (load context)              │
│  UserPromptSubmit - User input (inject context)             │
│                                                             │
│  KEY PRINCIPLES                                             │
│  - Use ${CLAUDE_PLUGIN_ROOT} for portable paths             │
│  - Plugin hooks use wrapper: {"hooks": {...}}               │
│  - Exit code 2 = blocking error (stderr to Claude)          │
│  - Commands are instructions FOR Claude                     │
│  - Test with claude --debug                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Skill Usage Protocol

**Before each task:**
1. Read task's skill requirements
2. Consult `@.claude/skills/SKILL-LIST.md`
3. Invoke process skills FIRST (brainstorming, debugging, TDD)
4. Invoke stack skills SECOND (hook-development, mcp-integration)
5. Follow skill instructions exactly

| When You Need | Invoke Skill |
|---------------|--------------|
| Hook creation | `hook-development` |
| MCP server setup | `mcp-integration` |
| Command creation | `command-development` |
| Agent creation | `agent-development` |
| Official docs | `working-with-claude-code` |
| AI Layer conventions | `work-with-ai-layer` |
| Creative work | `brainstorming` |
| Bug fixing | `systematic-debugging` |
| Writing tests | `test-driven-development` |
| Claiming done | `verification-before-completion` |

---

## AI Layer Integration

### Project Structure

```
ai_layer/
├── .claude/              ← Claude Code config (plugins, skills, hooks)
├── modules/              ← Product features
├── engines/              ← Core computation (8 engines)
├── deployments/          ← MCP servers
├── adapters/             ← External bridges
├── stacks/               ← Infrastructure
└── docs/                 ← Documentation
```

### Critical Rules

1. **Workspace isolation:** Every DB query needs `workspace_id`
2. **Architecture authority:** Check `@docs/architecture/ai-layer-architecture.md` before structural changes
3. **No direct core writes:** Engines emit events, don't write to `core` schema
4. **Profile-first:** Use `profile_id`, never `user_id` in engines

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Folders | `kebab-case` | `ctx-mcp` |
| Files | `kebab-case.ts` | `context.handler.ts` |
| MCP Tools | `{domain}_{verb}_{noun}` | `ctx_get_context` |
| Schemas | `lowercase` | `context`, `knowledge` |

### When Creating Components

| Component Type | AI Layer Location |
|----------------|-------------------|
| MCP Server | `deployments/{name}-mcp/` |
| Engine handler | `engines/{name}/handlers/` |
| Skill | `.claude/skills/{name}/` |
| Hook | `.claude/hooks/` or plugin `hooks/` |
| Command | `.claude/commands/` or plugin `commands/` |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 3.0.0 | 2026-01-09 | Added superpowers framework, skill index reference, AI Layer integration, work-with-ai-layer skill |
| 2.0.0 | 2026-01-09 | Revised with hook-development and working-with-claude-code skills |
| 1.0.0 | 2026-01-09 | Initial component selection guide |
