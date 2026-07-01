# 07 — Implementation Roadmap

A dependency-ordered, phased sequence. Every item is an independently shippable PR (or small PR
cluster). Sizing is rough: **S** ≈ ≤1 day, **M** ≈ 2–4 days, **L** ≈ 1–2 weeks of one engineer.
Risk is the blast radius / likelihood of regressions.

The ordering front-loads the **foundation the whole plan shares** (the facet taxonomy) and the
**highest-leverage, lowest-risk** documentation, then builds outward: enforce → manage → author →
orchestrate → harden.

---

## Phase gates (milestones)

| Milestone | Demonstrable capability | Unlocks |
|-----------|-------------------------|---------|
| **M0 — Aligned** | The ownership doc + facet taxonomy exist; team agrees the rule | All later review |
| **M1 — Principled** | Every property has a facet; `isOverridable` derived; misclassifications fixed | Enforcement, managed mode |
| **M2 — Enforced** | Apps/workspace cannot cross ownership boundaries at the mutation boundary | Trust for managed mode |
| **M3 — Managed** | An instance can be put in managed mode; UI edits locked; drift detected | GitOps prod story |
| **M4 — Authorable** | Workspace layer expressible as code (`twenty-sdk/config`), compiled & applied | The customer repo |
| **M5 — Orchestrated** | `plan`/`apply`/`promote` + CI + base⊕overlay + install matrix across instances | The end-state workflow |
| **M6 — Enterprise-ready** | Secrets, audit/evidence export, `adopt`, DR runbook | Regulated go-live |

---

## Phase 0 — Foundations (M0 → M1)

### PR0 — Ownership doc (S, no code risk)
`docs/APP_VS_WORKSPACE_OWNERSHIP.md`: the four-facet test, surfaces-as-commons, seed/upgrade/uninstall
lifecycle, enforcement invariant, managed vs self-serve. Becomes the review rubric for everything
below. *(This planning branch is the design source; PR0 lands a distilled, canonical version on the
real branch.)*

### PR1 — `facet` on the property registry; derive `isOverridable` (M, low risk)
- Add `facet: MetadataFacet` (+ optional `facetRationale`) to every entry of
  `ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME`.
- Add `facet.type.ts`; make `MetadataEntityOverridablePropertyName` derive from `facet`; **remove the
  hand-set `isOverridable`**.
- Constrain the config type so a missing `facet` fails to compile.
- Pure encoding change — behavior identical. This is the PR that **stops the debates recurring**.
- **Deps:** none. **Anchor:** `flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant.ts`.

### PR2a/2b/2c — Fix misclassifications, per entity (M each, medium risk)
- 2a `commandMenuItem`: `engineComponentKey` → `definition`; reconcile `availabilityType` /
  `conditionalAvailabilityExpression`; annotate tiebinders with `facetRationale`.
- 2b `pageLayoutWidget` / `pageLayoutTab`: audit `title`/`position`/`configuration`/`gridPosition`/
  `conditionalDisplay`.
- 2c `view` / `viewField` / `viewFieldGroup`: audit remaining overridable flags.
- Each ships a fast/slow instance command to **migrate or drop** existing overrides on
  now-`definition` properties (decision recorded per property).
- **Deps:** PR1. **Risk:** behavior change (workspace can no longer shadow a definition) → covered by
  tests in `08`.

**→ M1 reached.**

---

## Phase 1 — Enforcement & Unification (M1 → M2)

### PR3a — Thread caller attribution into metadata mutations (M, medium risk)
- Ensure every metadata mutation carries `{ callerKind, applicationId?, instanceMode }`.
- **Deps:** none hard, but needed by PR3. **Anchor:** resolvers + `object-metadata.service.ts`.

### PR3 — Mutation-boundary guard (M, medium risk)
- `assertMutationAllowed(...)` enforcing the facet+ownership rules (`03` §C): definitions writable
  only by owner; additive foreign creates attributed to caller; workspace facets writable by
  workspace-config always, by `ui` only when self-serve.
- **Deps:** PR1 (facets), PR3a. **Value:** M2 — the ownership invariant becomes real, not convention.

### PR4 — Unify the two override mechanisms (L, higher risk)
- Choose B1 (object/field extend `OverridableEntity`) or B2 (facet-typed `standardOverrides`)
  (decision in `09`). Migrate `standardOverrides` content; introduce the single
  `resolveEffectiveEntity` and retire per-entity resolvers.
- **Deps:** PR1. **Risk:** touches object/field resolve path (hot) → strong test coverage + a data
  migration.

**→ M2 reached** (PR3). PR4 can land in parallel with Phase 2 start.

---

## Phase 2 — Managed Mode & Drift (M2 → M3)

### PR5 — `WorkspaceConfigManifest` type + converters (M, low risk)
- New `twenty-shared` type (`03` §E.2) + `from-workspace-config-*` converters to universal-flat-entity.
- Pure additive types + pure functions. **Deps:** PR1.

### PR6 — `WorkspaceConfigSyncService` + layer composition (L, medium risk)
- New service beside `application-sync.service.ts`; `resolveEffectiveConfig` (base⊕overlay),
  `computeWorkspaceConfig…Maps`, and the ordered layer composition (`03` §E.4). Reuses
  `workspace-migration-runner`/`builder`.
- **Deps:** PR5, PR4 (unified overrides make this clean). **Value:** the workspace layer becomes
  diff/appliable.

### PR7 — Instance `mode` + managed guard + drift/plan mode (M, medium risk)
- Add `mode` to the instance/workspace record; wire the managed branch of the guard (`03` §D.1);
  implement `--dry-run` plan output + drift classification (`03` §D.2); audit hook on apply (`03` §D.3).
- **Deps:** PR3, PR6. **Value:** M3 — an instance can be managed, UI-locked, drift-reported.

**→ M3 reached.**

---

## Phase 3 — Authoring Layer (M3 → M4)

### PR8 — `twenty-sdk/config` `define*` helpers + facet-filtered types (M, low risk)
- `defineEnvironments`, `defineInstance`, `defineInstall`, `defineActivation`, `defineArrangement`,
  `definePresentation`, `defineValues`, `secretRef`. Types are facet-filtered projections of the real
  `*Manifest` types; validation reuses `createValidationResult`.
- **Deps:** PR1 (facet source of truth), PR5 (manifest type). **Value:** M4 — the workspace layer is
  authorable as code.

### PR9 — `twenty config validate` + build/compile pipeline (M, low risk)
- Collect `define*` files, facet-check, resolve `universalIdentifier` refs (dangling = error), enforce
  prod⇒exact pins, emit one `WorkspaceConfigManifest` per instance. **Deps:** PR8.

**→ M4 reached.**

---

## Phase 4 — GitOps Orchestration (M4 → M5)

### PR10 — `twenty config plan` (M, low risk)
- Wrap `deploy --dry-run`; structured + markdown output; per-instance fan-out (`--instance all`).
  **Deps:** PR7, PR9.

### PR11 — `twenty config apply` (M, medium risk)
- Apply workspace-config after app install; idempotent; writes audit record. **Deps:** PR7, PR9.

### PR12 — `twenty config promote` (M, low risk)
- Advance pins/overlays along `promotionOrder`; open/update the promotion PR. **Deps:** PR10/11.

### PR13 — Reference CI workflows + example repo scaffold (M, low risk)
- `plan.yml` / `apply-dev.yml` / `promote.yml` / `drift.yml`; a runnable `examples/bayer-twenty/`
  (core + one country + dev/prod-eu/prod-us overlays). **Deps:** PR10–12. **Value:** M5 — the full
  workflow runs end-to-end.

**→ M5 reached.**

---

## Phase 5 — Enterprise Hardening (M5 → M6)

### PR14 — Secrets (SOPS) integration (M, medium risk)
- `secrets.sops.yaml` decrypt-in-CI → `applicationVariable{isSecret}` / `connectionProvider`;
  `secretRef` plumbing; rotation flow. **Deps:** PR11.

### PR15 — Audit / evidence export (M, low risk)
- `twenty config evidence --instance X --since …` producing a CSV/PDF of changes (commit, actor,
  approver, diff, apply timestamp) from Git + CI + server audit. GxP/Part 11. **Deps:** PR11.

### PR16 — `twenty config adopt` (M, medium risk)
- Reverse path: extract live workspace-owned facets → emit `activation`/`arrangement`/`presentation`
  files. Onboarding from clickops/sandbox. **Deps:** PR9.

### PR17 — DR runbook + "rebuild from commit" test (S, low risk)
- Automated test: fresh instance + `apply` of a pinned commit → validated state; documented runbook.
  **Deps:** PR11.

### PR18 — Docs & DX polish (S)
- End-user docs, error-message quality pass, `plan` legibility, quickstart. **Deps:** all.

**→ M6 reached — regulated go-live ready.**

---

## Dependency graph (condensed)

```
PR0 ─┐
PR1 ─┼─► PR2a/b/c ─► (M1)
     ├─► PR3a ─► PR3 ─────────────► (M2)
     ├─► PR4 ───────────┐
     └─► PR5 ─► PR6 ────┴► PR7 ───► (M3)
                         PR8 ─► PR9 ─► (M4)
                                   ├─► PR10 ─┐
                                   ├─► PR11 ─┼► PR13 ─► (M5)
                                   └─► PR12 ─┘
                                        PR14/15/16/17/18 ─► (M6)
```

---

## Sequencing rationale

- **Facet first (PR1).** It is the shared dependency of enforcement, managed mode, the manifest type,
  and the SDK. Everything keys off it; do it once, early, as a pure encoding change.
- **Enforce before manage (PR3 before PR7).** Managed mode's guarantees are only trustworthy if the
  boundary is enforced; otherwise "managed" is advisory.
- **Unify overrides before workspace-config sync (PR4 before PR6).** One resolve path makes the
  workspace-config reconciler simple and avoids special-casing `standardOverrides`.
- **Author after the engine (PR8+ after PR6/7).** The SDK is thin sugar over a working server; build
  the server capability first so the DX layer has something real to call.
- **Harden last (Phase 5).** Secrets, evidence, adopt, DR are additive on a working core and are what
  turn "works" into "acceptable in a regulated enterprise."

## Parallelization

Two engineers: one drives PR1→PR2→PR3(+3a)→PR7; the other PR4→PR5→PR6, then converge on PR8+. Country
example content (PR13 scaffold) can be authored in parallel once PR8 lands.

## Effort estimate (order-of-magnitude)

~18 PRs; Phases 0–2 ≈ 4–6 engineer-weeks (the architectural core), Phases 3–4 ≈ 3–5 weeks (authoring +
orchestration), Phase 5 ≈ 2–3 weeks (hardening). Total ≈ **9–14 engineer-weeks**, comfortably
parallelizable to a shorter calendar time with 2–3 engineers. These are planning estimates, not
commitments; see `09` for the risks that could move them.
