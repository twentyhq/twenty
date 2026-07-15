# 10 — Test Strategy

## Phase 0 baseline format

Every baseline command records:

- UTC start timestamp
- Command (exact string)
- Duration (seconds)
- Exit code
- Status: `PASS` | `FAIL` | `BLOCKED`
- Failure class: `NONE` | `REPOSITORY` | `ENVIRONMENT_DEPENDENCY` | `SAFETY_PREREQUISITE`
- Concise summary
- Transient log file name

PASS requires `failureClass=NONE`. A failed safety guard records `status=BLOCKED`, `failureClass=SAFETY_PREREQUISITE`. Environment dependency failures (e.g., missing `pixman-1` for `canvas`) record `failureClass=ENVIRONMENT_DEPENDENCY`. Never describe an unrun, failed, or blocked command as passing.

## Documentation validators (Phase 0)

- `generate-directus-governance.mjs --check` — inventory reproducibility.
- `validate-directus-governance.mjs` — CSV/authority/denylist/object-family/link checks.
- `node --test tests/directus-governance.test.mjs` — contract tests.
- `render-mermaid.mjs` — exactly 10 diagrams render.
- Ajv JSON Schema validation against inventory and event schemas with valid/invalid fixtures.
- `git diff --check` and docs-only diff gate.

## Future test matrices

### Unit tests

- Identity mapping, field ownership, status transformations, event idempotency, echo-loop prevention, stage transitions, off-limits guard, conflict/waiver, consent-to-present, candidate presentation leakage, slate versioning, client visibility, fee/credit permissions, commercial firewall, search metric definitions, AI context allowlist, legacy score quarantine, retention propagation.

### Contract tests

- Directus schema fingerprint, required collection/field existence, type/nullability, ATS UUID behavior, event schema, API response transformation, file reference, status maps, round-trip publish fields, unknown-field tolerance.

### Integration tests

- Executive inbound sync, company outbound sync, opportunity publish/update/close, application inbound, candidate-visible stage outbound, availability/interview convergence, reference request/submission, candidate contest, dead-letter/replay, reconciliation, Directus outage, duplicate/out-of-order events, AI governed run, client access.

### End-to-end golden paths

- Retained Board search (prospect → placement → guarantee → portal reflects safe status).
- Confidential CEO search (codename, no public opportunity, no confidentiality leak).
- Portal applicant (event received once, identity resolved, candidacy created, stage syncs, internal notes never leave Twenty).
- Off-limits block (restriction → blocked outreach → waiver → approved → audit).
- Commercial firewall (identical executives with different tiers → identical results).
- AI criterion assessment (approved criteria, protected fields removed, human edits, no auto stage change).

### Security tests

- Cross-workspace, cross-client, client enumerating unshared candidates, Directus webhook forgery, replay, secret leakage, IDOR through external IDs, file URL leakage, stored XSS, SSRF, CSV formula injection, prompt injection, AI tool permission bypass, off-limits guard bypass, field-permission bypass, candidate identity disclosure leak, commercial/protected field leakage, log/cache-key leakage.

### Performance tests

- At representative scale: executive search, relationship path, assignment pipeline, market map, off-limits checks, client slate, sync queue throughput, reconciliation, status report, analytics, AI context build. Document dataset, hardware, query plans, and SLOs.
