# 09 — Migration and Backfill

## Principle: read-only first

The initial migration establishes identity links without disrupting the existing portal. No outbound writes during the initial read-only migration phase.

## Migration sequence

1. **Dry-run identity matching**
   - Directus executive → Twenty person/executiveProfile
   - Directus company → Twenty company/clientAccountProfile
   - Directus opportunity → Twenty executiveSearchPosition/searchAssignment
   - Directus application → Twenty searchCandidacy
2. **Use ATS UUIDs when valid** — never overwrite non-null `ats_uuid` until verified.
3. **Produce ambiguous match queue** — humans resolve ambiguous people/companies; no automatic overwrite.
4. **Backfill source records and external links** — create `externalEntityLink` entries.
5. **Backfill candidate stage events** — append-only; never overwrite history.
6. **Backfill interviews, references, and AI references** — as cross-reference records.
7. **Preserve raw source snapshots/hashes.**
8. **Check counts and referential integrity.**
9. **Support restart/checkpoint** — idempotent; resumable.
10. **Avoid outbound writes during initial read-only migration.**
11. **Run shadow sync** — process inbound events without applying writes; compare projections.
12. **Cut over field ownership in controlled stages.**

## Compatibility acceptance criteria

- Dry-run report lists creates, links, conflicts, skips, and errors.
- No portal record is overwritten during initial link.
- Restart is idempotent.
- Counts reconcile.
- Ambiguous people/companies require human resolution.
- Rollback plan exists.
- Shadow sync shows no unexplained drift.

## Retention and legal-hold reconciliation

Privacy deletion and legal-hold actions must propagate across both systems:

- When Twenty initiates a retention action, it propagates to synchronized Directus projections and derived AI/search data.
- When Directus initiates a retention action, Twenty receives the event and reconciles its projections.
- `retention_action_log` is an append-only shared reference; never rewritten.

## Rollback plan

Each cutover stage has a documented rollback:

- Field ownership cutover can be reversed by reverting to previous authority configuration.
- Outbound projection can be paused without data loss (events queue in outbox).
- Identity links can be deactivated without deletion.
- No destructive reconciliation runs automatically without a dry-run report and configured policy.
