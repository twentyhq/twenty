# Claude Code Framework

> AI Layer's Claude Code configuration for intelligent development workflows.

---

## Overview

This directory contains Claude Code's brain for the AI Layer project. It defines how Claude thinks, what skills it has, and how it automates workflows.

```
.claude/
├── README.md              ← You are here
├── settings.json          ← Hooks, permissions, MCP servers
├── settings.local.json    ← Local overrides (gitignored)
├── skills/                ← Domain expertise
│   ├── SKILL-LIST.md      ← Skill index (consult before every task)
│   └── {skill-name}/      ← Individual skills
├── commands/              ← Slash commands (/plan, /tdd, /review)
├── rules/                 ← Path-scoped auto-loading rules
├── templates/             ← Document templates
└── guides/                ← Workflow guides
```

---

## Superpowers Framework

**The Rule:** If even 1% chance a skill applies, INVOKE IT before proceeding.

```
User message received
       ↓
Consult SKILL-LIST.md
       ↓
Invoke process skills FIRST (brainstorming, debugging, TDD)
       ↓
Invoke stack skills SECOND (work-with-ai-layer, hook-development)
       ↓
Follow skill instructions exactly
       ↓
Respond
```

**Skill Index:** Always consult `@.claude/skills/SKILL-LIST.md` before tasks.

---

## Skills

Skills provide domain expertise. Organized by category:

| Category | Examples | When |
|----------|----------|------|
| **Process** | brainstorming, writing-plans, systematic-debugging, test-driven-development | HOW to approach tasks |
| **Stack** | work-with-ai-layer, hook-development, mcp-integration | Domain-specific guidance |
| **Architecture** | context-fundamentals, multi-agent-patterns, tool-design | Complex systems |
| **Meta** | using-superpowers, writing-clearly-and-concisely | Always applicable |

**Invocation order:**
1. Process skills first (determine approach)
2. Stack skills second (domain guidance)

---

## Commands

Slash commands for common workflows:

| Command | Purpose |
|---------|---------|
| `/plan {task}` | Create structured implementation plan |
| `/tdd {feature}` | Test-driven development workflow |
| `/review {code}` | Code review checklist |

---

## Rules

Path-scoped rules auto-load based on file paths:

| Rule | Activates For |
|------|---------------|
| `engines.md` | `engines/**/*` |
| `deployments.md` | `deployments/**/*` |
| `migrations.md` | `**/migrations/*.sql` |
| `testing.md` | `**/*.test.ts` |
| `documentation.md` | `docs/**/*.md` |

---

## Templates

Reference with `@.claude/templates/{name}.md`:

| Template | Use For |
|----------|---------|
| `plan.md` | Complex task tracking |
| `decision-record.md` | Technical decisions (ADR) |
| `feature-spec.md` | New feature design |
| `engine-spec.md` | New engine specification |
| `module-spec.md` | New module specification |
| `agent-template.md` | Domain-specialized sub-agents |
| `story.md` | Simple task tracking |

---

## Hooks

Event-driven automation in `settings.local.json`:

| Event | When | Script | Use For |
|-------|------|--------|---------|
| `SessionStart` | Session begins | `session-start.sh` | Load context (branch, plans, uncommitted changes) |
| `SessionEnd` | Session ends | `session-end.sh` | Log session history, warn about uncommitted changes |
| `UserPromptSubmit` | User input | `suggest-skills.sh` | Suggest relevant skills based on keywords |
| `PostToolUse` | After Write/Edit | inline | Run typecheck on .ts files |
| `Stop` | Agent stopping | inline | Log stop timestamp |

**Hook Scripts Location:** `.claude/hooks/scripts/`

**State Files:**
- `.claude/state/session-history.jsonl` - Session history log
- `.claude/logs/{date}.log` - Daily activity logs

---

## MCP Servers

External service integrations:

| Server | Purpose |
|--------|---------|
| `supabase` | Database operations |
| `serena` | Code analysis |
| `context7` | Documentation lookup |
| `n8n-mcp` | Workflow automation |

---

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` (root) | Always loaded, project overview |
| `CDS-FRAMEWORK.md` | Context Dimension System |
| `skills/SKILL-LIST.md` | Skill index for task planning |

---

## Workflow

### Starting Any Task

1. Check `SKILL-LIST.md` for applicable skills
2. Invoke skills before acting
3. Follow skill instructions exactly
4. Use templates for structured output

### Creating Plans

1. Invoke `writing-plans` skill
2. Invoke `work-with-ai-layer` skill
3. Reference skill index in plan header
4. List all skills for each task

### Executing Plans

1. Invoke `executing-plans` skill
2. For each task, invoke listed skills
3. Use `verification-before-completion` before claiming done

---

## Adding New Components

| Component | Location | Reference |
|-----------|----------|-----------|
| New skill | `skills/{name}/SKILL.md` | `writing-skills` skill |
| New command | `commands/{name}.md` | `command-development` skill |
| New hook | `settings.json` or plugin | `hook-development` skill |
| New rule | `rules/{name}.md` | Existing rules |
| New agent | `agents/{name}.md` | `agent-development` skill, `agent-template.md` |

---

## Related Documentation

- **Architecture:** `@docs/architecture/ai-layer-architecture.md`
- **PRD:** `@docs/AI-LAYER-PRD.md`
- **Component Guide:** `@docs/plans/2026-01-09-claude-code-component-guide.md`
