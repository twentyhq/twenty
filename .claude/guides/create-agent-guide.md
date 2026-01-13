# Create Agent Guide

> **To Execute:** Run `/superpowers:executing-plans` with this guide, or use `superpowers:subagent-driven-development` for interactive execution.

**Goal:** Create a new specialist agent using the standardized agent-template.md, including all required learnings docs and proper integration.

**Template:** `.claude/templates/agent-template.md`

**Architecture:** Agents are markdown files with YAML frontmatter that define triggering conditions and system prompts. Each agent has a companion learnings directory for tracking discoveries, query patterns, and sync status.

**Tech Stack:** Markdown, YAML frontmatter, Claude Code plugin system

---

## Prerequisites

Before starting, you need:
- The domain name (e.g., `context`, `knowledge`, `communication`)
- The domain path (e.g., `engines/context/`, `deployments/kb-mcp/`)
- Understanding of what the agent will specialize in

---

## Task 1: Copy Template to New Agent File

**Files:**
- Source: `.claude/templates/agent-template.md`
- Create: `.claude/agents/{domain}-specialist.md`

**Step 1: Determine domain name**

Ask user or determine from context:
- What domain does this agent cover?
- What is the path to the domain code?

**Step 2: Copy template**

```bash
cp .claude/templates/agent-template.md .claude/agents/{domain}-specialist.md
```

**Step 3: Verify file exists**

```bash
ls -la .claude/agents/{domain}-specialist.md
```
Expected: File exists with ~15KB size

---

## Task 2: Fill Metadata Header

**Files:**
- Modify: `.claude/agents/{domain}-specialist.md:1-8`

**Step 1: Update header fields**

Replace:
```markdown
# Agent Template: {Domain} Specialist

> **Status:** Draft | Active | Deprecated
> **Domain:** {domain-name}
> **Layer:** Engine | Module | Adapter | Deployment
> **Created:** {YYYY-MM-DD}
> **Updated:** {YYYY-MM-DD}
```

With actual values:
```markdown
# Agent Template: Context Specialist

> **Status:** Active
> **Domain:** context
> **Layer:** Engine
> **Created:** 2026-01-11
> **Updated:** 2026-01-11
```

**Step 2: Save and verify**

```bash
head -10 .claude/agents/{domain}-specialist.md
```
Expected: Header shows correct domain name and dates

---

## Task 3: Define Overview Section

**Files:**
- Modify: `.claude/agents/{domain}-specialist.md:11-41`

**Step 1: Write purpose paragraph**

Replace `{One paragraph...}` with actual purpose, e.g.:
```markdown
### 1.1 Purpose

The Context Specialist handles all operations related to the Context Engine:
user state tracking, mode management, calculated indices (risk, engagement),
skill/competency management, and event aggregation from all other engines.
```

**Step 2: Define scope boundaries**

```markdown
### 1.2 Domain Scope

**This agent IS responsible for:**
- User state and mode management
- Calculating and explaining indices (risk, engagement, satisfaction)
- Managing profile preferences and skills
- Aggregating events from all engines

**This agent is NOT responsible for:**
- Sending communications (Communication Engine)
- Journey/workflow management (Journey Engine)
- Business decisions (Operation Engine)
```

**Step 3: Define layer position**

Update the ASCII diagram with actual sibling agents.

---

## Task 4: Write YAML Frontmatter

**Files:**
- Modify: `.claude/agents/{domain}-specialist.md:45-75`

**Step 1: Write frontmatter with examples**

```yaml
---
name: {domain}-specialist
description: |
  Use this agent when working with {domain} that involves {specific triggers}.
  MUST BE USED for any {domain} RPC operations or MCP tool calls.

  <example>
  Context: User needs to understand a {domain} concept
  user: "How does the {domain} engine calculate X?"
  assistant: "I'll use the {domain}-specialist agent to analyze this."
  <commentary>
  {Domain} calculations are core {domain} Engine functionality.
  </commentary>
  </example>

  <example>
  Context: User wants to modify {domain} behavior
  user: "Add a new attribute to the {domain} engine"
  assistant: "I'll use the {domain}-specialist to implement this."
  <commentary>
  Attribute management is {domain} Engine responsibility.
  </commentary>
  </example>

model: inherit
color: blue
allowedTools:
  - Read
  - Grep
  - Glob
  - Bash(git *)
  - Bash(npm *)
  - mcp__serena__*    # If domain uses Serena
disallowedTools:
  - WebSearch         # Unless agent needs web access
  - Bash(rm -rf *)    # Safety: block destructive commands
---
```

**Permission Pattern Guide:**
- Use `Bash(prefix *)` to allow only certain commands
- Use `mcp__{server}__*` for MCP tool access
- Use `Skill(name)` for skill invocation control
- See `agent-template.md` Section 2.3 for full reference

**Step 2: Verify YAML is valid**

```bash
head -80 .claude/agents/{domain}-specialist.md | grep -A 30 "^---"
```
Expected: Valid YAML frontmatter with name, description, examples

---

## Task 5: Write System Prompt

**Files:**
- Modify: `.claude/agents/{domain}-specialist.md:98-160`

**Step 1: Define expert persona**

```markdown
You are a {Domain} Engine Specialist responsible for {primary responsibility}.

**Your Domain Expertise:**
1. {Specific knowledge area 1}
2. {Specific knowledge area 2}
3. {Key relationships in domain}

**Your Core Responsibilities:**
1. {Primary task}
2. {Secondary task}
3. {Coordination with other engines}
```

**Step 2: Add domain context**

```markdown
**Domain Context You Understand:**
- Schema: `{schema_name}` - {tables and purpose}
- RPC Functions: {list key functions}
- Events: {events produced/consumed}
- Dependencies: {what this domain needs}
```

**Step 3: Define analysis process**

```markdown
**When Invoked:**
1. First, read domain documentation
2. Check current state/status
3. Analyze the request
4. Execute appropriate action
5. Update learnings if discoveries made
```

---

## Task 6: Create Learnings Directory

**Files:**
- Create: `.claude/learnings/{domain}/LEARNINGS.md`
- Create: `.claude/learnings/{domain}/QUERIES.md`
- Create: `.claude/learnings/{domain}/STATUS.json`

**Step 1: Create directory**

```bash
mkdir -p .claude/learnings/{domain}/
```

**Step 2: Copy template files**

```bash
cp .claude/learnings/journey/LEARNINGS.md .claude/learnings/{domain}/
cp .claude/learnings/journey/QUERIES.md .claude/learnings/{domain}/
cp .claude/learnings/journey/STATUS.json .claude/learnings/{domain}/
```

**Step 3: Verify files exist**

```bash
ls -la .claude/learnings/{domain}/
```
Expected: 3 files (LEARNINGS.md, QUERIES.md, STATUS.json)

---

## Task 7: Update Learnings Files

**Files:**
- Modify: `.claude/learnings/{domain}/LEARNINGS.md:1-10`
- Modify: `.claude/learnings/{domain}/STATUS.json`

**Step 1: Update LEARNINGS.md header**

```markdown
# {Domain} Engine Agent Learnings

> **Agent:** {domain}-specialist
> **Domain:** `{domain_path}/`
> **Started:** 2026-01-11
> **Last Updated:** 2026-01-11
> **Total Entries:** 0
```

**Step 2: Update STATUS.json**

```json
{
  "agent": "{domain}-specialist",
  "domain_path": "{domain_path}/",
  "last_sync": "2026-01-11T00:00:00Z",
  "knowledge_state": {
    "readme_hash": "pending",
    "schema_version": "pending",
    "rpc_count": 0,
    "files_tracked": 0
  },
  "health": {
    "domain_accessible": true,
    "dependencies_ok": true,
    "last_check": "2026-01-11T00:00:00Z"
  },
  "stats": {
    "discoveries": 0,
    "assumptions": 0,
    "edge_cases": 0,
    "anti_patterns": 0,
    "query_patterns": 0
  }
}
```

**Step 3: Clear template content from QUERIES.md**

Remove journey-specific query examples, leave structure intact.

---

## Task 8: Update Learnings INDEX

**Files:**
- Modify: `.claude/learnings/INDEX.md`

**Step 1: Add new agent to table**

In the Agents section, add row:
```markdown
| [{domain}-specialist]({domain}/LEARNINGS.md) | `{domain_path}/` | [View]({domain}/LEARNINGS.md) | [View]({domain}/QUERIES.md) | [JSON]({domain}/STATUS.json) |
```

**Step 2: Update Quick Stats table**

Add row:
```markdown
| {domain}-specialist | 0 | 0 | 0 | 0 |
```

**Step 3: Verify index**

```bash
grep "{domain}" .claude/learnings/INDEX.md
```
Expected: New agent appears in both tables

---

## Task 9: Add Learnings Section to Agent

**Files:**
- Modify: `.claude/agents/{domain}-specialist.md`

**Step 1: Find Key Documentation section**

Search for `## Key Documentation` or similar section near end of file.

**Step 2: Add Learnings & Status section after it**

```markdown
---

## Learnings & Status

> **Track your knowledge** - Update these files during operation.

| Document | Path | Purpose |
|----------|------|---------|
| Learnings | `.claude/learnings/{domain}/LEARNINGS.md` | Discoveries, assumptions, edge cases |
| Queries | `.claude/learnings/{domain}/QUERIES.md` | SQL/RPC patterns |
| Status | `.claude/learnings/{domain}/STATUS.json` | Sync state, freshness |

**Before starting:** Check `STATUS.json` - is knowledge stale (>24h)?

**During work:** Note discoveries, new query patterns, edge cases

**Before completion:**
- [ ] Update LEARNINGS.md if discoveries made
- [ ] Update QUERIES.md if new SQL/RPC patterns used
- [ ] Update STATUS.json with current timestamp
```

---

## Task 10: Validate Agent Structure

**Files:**
- Read: `.claude/agents/{domain}-specialist.md`

**Step 1: Check required sections exist**

```bash
grep -E "^## " .claude/agents/{domain}-specialist.md
```
Expected sections:
- Overview
- Agent Definition
- System Prompt (or inline after frontmatter)
- Key Documentation
- Learnings & Status
- Quality Standards (optional)

**Step 2: Validate frontmatter**

```bash
head -50 .claude/agents/{domain}-specialist.md | grep -c "^---"
```
Expected: 2 (opening and closing frontmatter delimiters)

**Step 3: Verify learnings references**

```bash
grep "learnings" .claude/agents/{domain}-specialist.md | wc -l
```
Expected: At least 3 references

---

## Task 11: Test Agent Triggering

**Step 1: Verify agent appears in Claude Code**

The agent should now be available. Test by checking if Claude Code recognizes it.

**Step 2: Test with a domain-specific query**

Ask something specific to the domain and verify the agent is suggested or used.

**Step 3: Document any issues**

If agent doesn't trigger correctly, check:
- YAML frontmatter syntax
- Description examples format
- Name matches file name pattern

---

## Task 12: Commit Changes

**Step 1: Stage new files**

```bash
git add .claude/agents/{domain}-specialist.md
git add .claude/learnings/{domain}/
git add .claude/learnings/INDEX.md
```

**Step 2: Commit**

```bash
git commit -m "feat(agents): add {domain}-specialist agent

- Created {domain}-specialist from agent-template
- Added learnings directory structure
- Updated learnings INDEX
- Integrated with hookify enforcement system

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Step 3: Verify commit**

```bash
git log -1 --oneline
git status
```
Expected: Clean working tree, commit shows new agent

---

## Checklist Summary

After completing all tasks, verify:

- [ ] Agent file exists: `.claude/agents/{domain}-specialist.md`
- [ ] Valid YAML frontmatter with name, description, examples
- [ ] System prompt defines expertise and process
- [ ] Learnings directory: `.claude/learnings/{domain}/`
- [ ] LEARNINGS.md updated with agent name
- [ ] QUERIES.md structure present
- [ ] STATUS.json initialized
- [ ] INDEX.md updated with new agent
- [ ] Agent references its learnings files
- [ ] Changes committed

---

## Quick Reference

**Files Created:**
```
.claude/agents/{domain}-specialist.md
.claude/learnings/{domain}/LEARNINGS.md
.claude/learnings/{domain}/QUERIES.md
.claude/learnings/{domain}/STATUS.json
```

**Files Modified:**
```
.claude/learnings/INDEX.md
```

**Key Commands:**
```bash
# Create learnings
mkdir -p .claude/learnings/{domain}/
cp .claude/learnings/journey/* .claude/learnings/{domain}/

# Validate
grep "^## " .claude/agents/{domain}-specialist.md
grep "{domain}" .claude/learnings/INDEX.md

# Commit
git add .claude/agents/{domain}-specialist.md .claude/learnings/{domain}/ .claude/learnings/INDEX.md
git commit -m "feat(agents): add {domain}-specialist agent"
```
