# 00 — Repository Audit & Baseline

> **Phase 0 deliverable.** Documents the repository baseline, runtime environment, inspected
> architecture, and pre-existing build/test status at the start of the Executive Search OS
> programme. All findings are as of the base SHA below; no production code was modified.

---

## 1. Repository Identity

| Field                  | Value                                               |
| ---------------------- | --------------------------------------------------- |
| Repository             | `danknasty/twenty` (fork of twentyhq/twenty)        |
| Package name / version | `twenty` / `0.2.1`                                  |
| Base branch            | `main`                                              |
| Base SHA               | `58fcb3cb0ff21d0e4d1a5f00c85d5736de2e33af`          |
| Working branch         | `vorflux/executive-search-phase0`                   |
| Diff scope             | `docs/executive-search/**` only (docs-only Phase 0) |

---

## 2. Runtime Environment

| Component | Version             | Notes                                                                     |
| --------- | ------------------- | ------------------------------------------------------------------------- |
| Node.js   | **v24.5.0**         | Via `nvm`; `.nvmrc` specifies `24.16.0` but 24.5.0 is installed and used. |
| Yarn      | **4.13.0** (Berry)  | Via corepack; npm is blocked.                                             |
| Nx        | resolved from cache | Monorepo task orchestrator.                                               |

All commands were run with `source ~/.nvm/nvm.sh && nvm use 24.5.0` prefixed.

---

## 3. Baseline Test & Build Results

The following targets were run individually to establish a pre-change baseline.
All failures are **pre-existing environment dependency issues** in the repository's
build chain — not caused by Phase 0 changes (which are docs-only under
`docs/executive-search/`).

| #   | Command                      | Exit Code | Status   | Failure Class            | Root Cause                                              |
| --- | ---------------------------- | --------- | -------- | ------------------------ | ------------------------------------------------------- |
| 1   | `nx typecheck twenty-server` | 130       | **FAIL** | `ENVIRONMENT_DEPENDENCY` | Cascaded from `twenty-emails:build` + `twenty-ui:build` |
| 2   | `nx build twenty-shared`     | 0         | **PASS** | —                        | Succeeded (cache hit on generateBarrels + vite build)   |
| 3   | `nx build twenty-server`     | 130       | **FAIL** | `ENVIRONMENT_DEPENDENCY` | Same dependency-chain failure as #1                     |
| 4   | `nx typecheck twenty-front`  | 130       | **FAIL** | `ENVIRONMENT_DEPENDENCY` | Cascaded from `twenty-ui:build`                         |
| 5   | `nx test twenty-front`       | 130       | **FAIL** | `ENVIRONMENT_DEPENDENCY` | Cascaded from `twenty-ui:build`                         |

> Run timestamp: `2026-07-15T17:49:56Z` – `2026-07-15T17:50:04Z`. Full log at
> `/var/tmp/executive-search-phase0-baseline/individual-baseline.log`.

### 3.1 Root-Cause Detail

Two packages are missing from `node_modules`, breaking the shared build chain:

**a) `expr-eval-fork` (affects `twenty-emails:build`)**

```
[vite]: Rollup failed to resolve import "expr-eval-fork" from
  "packages/twenty-shared/dist/utils.mjs".
```

The `twenty-shared/dist/utils.mjs` barrel imports `expr-eval-fork`, but the
package is not installed in `node_modules`. This causes `twenty-emails:build`
(which bundles `twenty-shared`) to fail. Any target that depends on
`twenty-emails:build` cascades to exit 130.

**b) `vite-plugin-sass-dts` (affects `twenty-ui:build`)**

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite-plugin-sass-dts'
  imported from .../twenty-ui/node_modules/.vite-temp/vite.config.ts...
```

The `twenty-ui` Vite config imports `vite-plugin-sass-dts`, which is not in
`node_modules`. This blocks `twenty-ui:build` and cascades to every target
that depends on it (typecheck/build/test for `twenty-front` and `twenty-server`).

### 3.2 DB Integration Suite

The `assert-disposable-postgres.mjs` guard was created to verify a disposable
Postgres instance is available before running the database-reset integration
suite. **No local Postgres is configured** in this environment, so the suite
was **not run** (expected `BLOCKED` with reason `SAFETY_PREREQUISITE`). This is
documented, not a regression.

### 3.3 Conclusion

All five build/test failures are `ENVIRONMENT_DEPENDENCY` — missing npm packages
(`expr-eval-fork`, `vite-plugin-sass-dts`) in the workspace. Phase 0 introduces
zero source code changes; these failures would occur identically on the base
SHA. The only target that ran cleanly (`twenty-shared:build`) confirms the
shared package itself compiles.

---

## 4. Architecture Inspection Summary

The following capabilities were verified by inspecting the repository source.
These findings inform the Phase 0 design documents (§03–§08, ADRs) and the
roadmap's build-phase assumptions.

### 4.1 Standard Objects & Application Registration

| Area                           | Path                                                                               | Finding                                                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standard object constants      | `packages/twenty-shared/src/metadata/constants/standard-object.constant.ts`        | Canonical registry of universal identifiers. Comments warn: _"Never ever mutate an existing universal identifier."_                                      |
| Standard application builders  | `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/` | Module + services + utils that register the standard object set per workspace.                                                                           |
| First-party apps               | `packages/twenty-apps/public/`                                                     | 8 apps: `call-recorder`, `people-data-labs`, `twenty-discord`, `twenty-exa`, `twenty-fireflies`, `twenty-last-contact`, `twenty-linear`, `twenty-slack`. |
| Hybrid pattern (Call Recorder) | `modules/call-recording/` + `packages/twenty-apps/public/call-recorder/`           | Core standard object in server modules **and** a first-party app — the blueprint for our executive-search objects.                                       |

### 4.2 App SDK

| Area              | Path                                  | Finding                                                                                                                                                                                                                                                  |
| ----------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Define primitives | `packages/twenty-sdk/src/sdk/define/` | `defineApplication`, `defineField`, `defineAgent`, `defineLogicFunction`, `defineCommandMenuItem`, `defineConnectionProvider`, `defineConditionalAvailability`, `defineFrontComponent`, `defineIndex`. Discovery is AST-based, not directory-convention. |

### 4.3 Permissions & Row-Level Security

| Area                         | Finding                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| Field-level read permissions | ORM-enforced via `permissions.utils.ts` — field-read is filtered at the query layer.                   |
| Row-level security           | `apply-row-level-permission-predicates.util.ts` — predicate-based row filtering applied at query time. |

### 4.4 Events & Message Queue

| Area             | Path                                 | Finding                                                                                                                                                        |
| ---------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workspace events | `engine/workspace-event-emitter/`    | In-memory `EventEmitter2` wrapper. **Not transactional** — no outbox, no replay, no durability guarantee. Events lost on crash. **Gap to address in roadmap.** |
| Message queue    | `engine/core-modules/message-queue/` | BullMQ-based wrapper. New queues added via enum member in `message-queue.constants.ts`. Supports priorities, workers, drivers.                                 |
| Event logs       | `engine/core-modules/event-logs/`    | Append-only event log table (for audit), but not a replayable event bus.                                                                                       |

### 4.5 AI Infrastructure

| Area       | Path                          | Finding                                                                                                                                                                                                                           |
| ---------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI modules | `engine/metadata-modules/ai/` | Sub-modules: `ai-agent`, `ai-agent-execution`, `ai-agent-monitor`, `ai-agent-role`, `ai-billing`, `ai-chat`, `ai-generate-text`, `ai-models`, `ai-workspace-stats`. This is the foundation for ADR-0001 (AI governance registry). |

### 4.6 Database Migration & Upgrade Pipeline

| Area             | Path                                                                       | Finding                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Upgrade commands | `packages/twenty-server/docs/UPGRADE_COMMANDS.md`                          | Two command types: instance-level (schema/data migrations, once-per-instance) and workspace-level (iterate over all active/suspended workspaces). |
| Decorators       | `@RegisteredInstanceCommand`, `@RegisteredWorkspaceCommand`                | Auto-discovered by the upgrade pipeline. Instance commands auto-register in `instance-commands.constant.ts` (do not edit manually).               |
| Generation       | `nx run twenty-server:database:migrate:generate --name <name> --type <fast | slow>`                                                                                                                                            | Generates timestamped command files. Fast = non-locking; slow = locking migration. |

### 4.7 Directus Integration — Status

| Check                        | Result                                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Directus source code in repo | **None.** Zero Directus references exist in `packages/`. No adapter, no SDK, no schema sync.                                                                                                           |
| Directus instance access     | **`UNVERIFIED_NO_ACCESS`** — no Directus credentials, URL, or schema snapshot was available during Phase 0.                                                                                            |
| Schema fingerprint           | `UNKNOWN_PENDING_SCHEMA_SNAPSHOT` — all per-field schema attributes (type, nullability, uniqueness, relation target, delete behavior, AI eligibility) use this sentinel pending a real schema capture. |
| Basis for authority mapping  | Compatibility matrix (`uploaded-artifact-1.md`) only — 140 collections transcribed, 7-value canonical authority enum applied.                                                                          |

---

## 5. Governance Package Validation (This Phase)

The Phase 0 deliverables under `docs/executive-search/` include a self-validating
governance package with scripts, tests, schemas, and fixtures. All passed:

| Check                            | Command                                                 | Result                                                |
| -------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| Generator reproducibility        | `node scripts/generate-directus-governance.mjs --check` | ✅ PASSED                                             |
| Governance validation            | `node scripts/validate-directus-governance.mjs`         | ✅ PASSED                                             |
| Contract tests                   | `node --test tests/directus-governance.test.mjs`        | ✅ 19/19 pass, 0 fail                                 |
| Mermaid block count              | `node scripts/render-mermaid.mjs --skip-render`         | ✅ 10 blocks found                                    |
| JSON Schema (Ajv, draft 2020-12) | 5 schema×fixture checks                                 | ✅ 5/5 (valid fixtures pass, invalid fixtures reject) |
| Prettier formatting              | `prettier@3.6.2 --check '**/*.{md,json}'`               | ✅ All files conform                                  |
| Whitespace / conflict markers    | `git diff --check`                                      | ✅ Clean                                              |

---

## 6. Capability Gaps Identified for Roadmap

These gaps (documented in §03, §05, §08 and the ADRs) are confirmed by this
audit and scoped to later build phases:

| Gap                          | Current State                                   | Roadmap Phase             |
| ---------------------------- | ----------------------------------------------- | ------------------------- |
| Transactional outbox         | In-memory EventEmitter2 only — no durability    | PR2–PR5 (sync foundation) |
| Idempotency keys             | Not implemented in event/message infra          | PR5–PR7                   |
| Dead-letter queue / re-drive | BullMQ has DLQ concept but no re-drive pipeline | PR8                       |
| Reconciliation engine        | No reconciliation or drift-detection runtime    | PR10–PR12                 |
| Directus adapter             | Zero Directus code exists                       | PR15–PR20                 |
| AI governance registry       | AI infra exists but no governance/audit layer   | PR28–PR30                 |
| Client collaboration portal  | Access model undefined                          | PR21 (ADR-0002 gate)      |
