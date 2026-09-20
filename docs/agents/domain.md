# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root: it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`**: system-wide decisions that touch the area you're about to work in.
- **`packages/<context>/docs/adr/`**: context-scoped decisions for the specific package you're touching.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

This repo is an Nx/Yarn-workspaces monorepo (`packages/*`, no root `src/`) forked from `twentyhq/twenty`. Most of `packages/*` is stock upstream Twenty, already governed by its own root `CLAUDE.md` — it does not need a `CONTEXT.md` of its own. Multi-context applies specifically to JAI-OS's own new work, each living in its own package:

```
/
├── CONTEXT-MAP.md                     ← points only at JAI-OS-owned contexts below
├── docs/adr/                          ← system-wide decisions (e.g. Controlled Tool API boundary)
├── jai-os-docs/                       ← product/requirements source of truth, not code-context docs
└── packages/
    ├── twenty-front/, twenty-server/, ...   ← stock upstream Twenty, no CONTEXT.md
    └── <jai-os-package>/               ← e.g. a future controlled-tool-api or agent-runtime package
        ├── CONTEXT.md
        └── docs/adr/                   ← context-specific decisions
```

`CONTEXT-MAP.md` and each package's `CONTEXT.md` do not exist yet — nothing JAI-OS-specific has been built. Create them lazily, per package, as real decisions get made (see `jai-os-docs/08-build-phases.md` for build order).

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md` — or, until one exists for the relevant package, the term as defined in `jai-os-docs/` (e.g. "Controlled Tool API", "Opportunity", "escalation"). Don't drift to synonyms the docs explicitly avoid.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR / doc conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_

The same applies to `jai-os-docs/` until ADRs exist for a given decision — those files are the source of truth per project instructions, and any deviation gets flagged to the user before proceeding, not silently made.
