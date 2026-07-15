# 11 — Rollout Plan

## Phase 0 PR boundary

This pull request is docs-only. All changes are under `docs/executive-search/`. No production/runtime code, standard objects, workspace entities, migrations, upgrade commands, sync workers, or runtime configuration is added or changed. Scripts and tests inside the docs tree have no runtime-package imports or production side effects.

## Later dependency order

The program proceeds through 35 dependency-ordered pull requests after Phase 0. Each requires its own plan and approval against the then-current base branch.

1. R0 — Phase 0 approval (evidence, ownership, contracts, baseline).
2. PR2–PR5: app shell, identifiers, sync foundation, Directus adapter, executive profile.
3. PR6–PR8: commercial firewall, client CRM, BD extensions.
4. PR9–PR11: engagement terms, search assignment, position specification.
5. PR12: Directus company/opportunity publish projection.
6. PR13–PR15: research, relationship intelligence, off-limits/conflict guards.
7. PR16–PR18: candidacy, stage events, application inbound, candidate-visible outbound.
8. D1 — Client decision checkpoint (immediately before PR21).
9. PR19–PR22: assessment, slates, presentations, client collaboration, feedback, reports.
10. D2 — Scheduling decision checkpoint (immediately before PR23).
11. PR23–PR25: interviews, scorecards, references, diligence.
12. PR26–PR27: independence/commitment review, placement/fees/guarantee.
13. PR28: board composition and matrix.
14. PR29: analytics semantic layer.
15. D3 — AI authority checkpoint (immediately before PR30).
16. PR30–PR34: AI governance, drafting/synthesis, research AI, criterion assessment shadow, dossier/board matrix AI.
17. PR35: migration/backfill and shadow sync.
18. PR36: security, performance, accessibility, docs, rollout.

## Feature flags and default-off gates

The following remain default-off until their specific approved plans and exit gates complete:

- Directus inbound/outbound sync.
- Client portal access.
- Candidate-affecting AI (review-only).
- Automatic client sharing.
- Automatic stage changes.
- Recording.
- External enrichment.
- Outbound writes to Directus.

## Operational readiness checkpoints

| Checkpoint                           | Gate                       | Criteria                                                                  |
| ------------------------------------ | -------------------------- | ------------------------------------------------------------------------- |
| R2 — Durable read-only bridge        | After PR4 (live exit gate) | Mock/live shadow events process with replay/DLQ/drift; no Directus writes |
| R3 — Internal CRM/BD                 | After PR8                  | Firm can manage prospect-to-win                                           |
| R4 — Search assignment pilot         | After PR11                 | Assignment/specification/milestones work                                  |
| R5 — Assignment pilot                | After PR15                 | Research/off-limits/candidacy in pilot                                    |
| R6 — Research/off-limits pilot       | After PR15                 | Off-limits guard blocks outreach; waiver works                            |
| R7 — Candidacy shadow sync           | After PR18                 | Candidate-visible status syncs safely                                     |
| R8 — Client collaboration alpha      | After PR22                 | Client sees only shared records                                           |
| R9 — Interview/reference integration | After PR25                 | Scheduling converges; references tracked                                  |
| R10 — Placement/guarantee            | After PR27                 | Placement records fees and guarantee milestones                           |
| R11 — Low-risk AI drafting           | After PR31                 | Human-approved drafting works                                             |
| R12 — AI assessment shadow           | After PR33                 | Shadow mode measures correctness; no auto changes                         |

## Acceptance criteria matrix

| AC                                     | File(s)                                                  | Validation                       |
| -------------------------------------- | -------------------------------------------------------- | -------------------------------- |
| AC1: 140 collections once              | directus-collection-map.csv, inventory.json              | Validator + tests                |
| AC2: Declared totals labeled           | 02-directus-schema-inventory.md, inventory.json          | Tests assert 140/2432/421        |
| AC3: Sentinel usage                    | inventory.json                                           | Tests assert exact sentinel      |
| AC4: One owner per field               | directus-field-ownership.csv                             | Validator + tests                |
| AC5: No portal + passive/confidential  | 03-system-boundaries, 04-domain-model                    | Manual trace                     |
| AC6: Three-opportunity semantics       | 04-domain-model.md                                       | Diagram + prose                  |
| AC7: No-sync/firewall rules            | 07-commercial-selection-firewall, denylist/firewall CSVs | Validator + tests                |
| AC8: Repository audit gaps             | 00-repository-audit.md                                   | Manual trace                     |
| AC9: 10 Mermaid diagrams               | across docs                                              | render-mermaid.mjs               |
| AC10: Ownership pinned + ADRs proposed | core-app-object-ownership.csv, adrs/                     | Validator + tests                |
| AC11: Baseline results                 | 00-repository-audit.md                                   | Result table with exact outcomes |
| AC12: Formatting/links/diff            | all files                                                | Final validation pipeline        |
| AC13: Prior-plan classification        | 01-business-model-and-personas.md                        | Manual trace                     |
