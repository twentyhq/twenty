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
| **M(−1) — Validated** | The riskless ladder ([`11-derisking-and-validation.md`](./11-derisking-and-validation.md)) confirms the facet model, engine reuse, and guardrail locations **with evidence** — at near-zero risk | Confidence to start any behavior-changing work |
| **M0 — Aligned** | The ownership doc + facet taxonomy exist; team agrees the rule | All later review |
| **M1 — Principled** | Every property has a facet; `isOverridable` derived; misclassifications fixed | Enforcement, managed mode |
| **M2 — Enforced** | Apps/workspace cannot cross ownership boundaries at the mutation boundary | Trust for managed mode |
| **M3 — Managed** | An instance can be put in managed mode; UI edits locked; drift detected | GitOps prod story |
| **M4 — Authorable** | Workspace layer expressible as code (`twenty-sdk/config`), compiled & applied | The customer repo |
| **M5 — Orchestrated** | `plan`/`apply`/`promote` + CI + base⊕overlay + install matrix across instances | The end-state workflow |
| **M6 — Enterprise-ready** | Secrets, audit/evidence export, `adopt`, DR runbook | Regulated go-live |

---

## Phase −1 — De-risking & Validation (→ M(−1)) · **start here**

The riskless ladder from [`11-derisking-and-validation.md`](./11-derisking-and-validation.md). Every rung
is **inert / read-only / test-only** and validates one hypothesis before any behavior changes. Do this
first; it is the safe first mile and it produces the evidence that de-risks everything below.

- **A0 — Ownership doc** (S, no code) — the facet vocabulary + invariants. *(= the old PR0.)*
- **A1 — Inert `facet` annotation + characterization test** (M, **zero runtime risk**) — add `facet` as
  pure metadata; keep `isOverridable` hand-set/authoritative; a test asserts
  `deriveOverridable(facet) === isOverridable` except a `KNOWN_FACET_MISMATCHES` allow-list. The merged
  mismatch list **is** the evidence for the definition-leak thesis (H1/H2).
- **A2 — Characterization tests at the hot spots** (M, test-only) — pin `sanitizeOverridableEntityInput`
  routing, `isCallerOverridingEntity` policy, the uninstall `DROP TABLE … CASCADE` data-loss, and
  personal-view containment. Converts the scariest review findings into checked-in facts (H4).
- **A3 — Read-only `plan`/`--dry-run` over an existing app** (S–M, read-only, flag-gated) — print the
  diff the engine already computes; never apply. Validates the GitOps primitive (H3).
- **A4 — `twenty-sdk/config` types + compiled example, no server apply** (M, pure SDK) — the `define*`
  types + `resolveEffectiveConfig` (pure merge) + `twenty config validate`. Validates DX + forces the
  deep-merge decision (H5).
- **A5 — Sandbox apply spike vs a throwaway config app, integration-test only** (M, test DB) — apply a
  small `WorkspaceConfigManifest` through a **dedicated** config identity; assert personal views +
  definitions untouched. End-to-end proof (H3+H4).

**Gate:** proceed to Phase 0+ only after the ladder confirms its hypotheses. If a rung refutes one, we
learned it for the price of a constant/test/flag, not a hot-path refactor.

## Phase 0 — Foundations (M0 → M1)

### PR0 — Ownership doc (S, no code risk)
`docs/APP_VS_WORKSPACE_OWNERSHIP.md`: the four-facet test, surfaces-as-commons, seed/upgrade/uninstall
lifecycle, enforcement invariant, managed vs self-serve. Becomes the review rubric for everything
below. *(This planning branch is the design source; PR0 lands a distilled, canonical version on the
real branch.)*

### PR1 — `facet` as an **inert annotation** (M, **zero runtime risk**) · = ladder rung A1
> **Review-hardened correction.** `isOverridable` is **not** inert — it feeds
> `ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME` → `sanitizeOverridableEntityInput`, which routes edited
> properties into the `overrides` JSONB vs. the base row at runtime. So deriving `isOverridable` from
> `facet` **is** a behavior change, and cannot ship as "PR1 the no-op." PR1 is split from PR2.

- Add `facet: MetadataFacet` (+ optional `facetRationale`) to every entry of
  `ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME` as **pure metadata read by nothing**.
- Keep the hand-set `isOverridable` **authoritative and untouched**. Add `facet.type.ts`.
- Add a test asserting `deriveOverridable(facet) === isOverridable` for all properties **except** an
  explicit `KNOWN_FACET_MISMATCHES` allow-list (the definition-leaks PR2 will fix). The merged list is
  the evidence for the leak thesis.
- Constrain the config type so a missing `facet` fails to compile. Truly reversible/no-op.
- **Deps:** none. **Anchor:** `flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant.ts`.

### PR2a/2b/2c — Derive `isOverridable` from `facet`, fix misclassifications, **+ atomic migration** (M each, medium–high risk)
- Switch `MetadataEntityOverridablePropertyName`/`isOverridable` to be **derived** from `facet` and
  **remove the hand-set field** — this is the behavior-changing step, done here, not in PR1.
- 2a `commandMenuItem`: `engineComponentKey` → `definition`; reconcile `availabilityType` /
  `conditionalAvailabilityExpression`; annotate tiebreakers with `facetRationale`.
- 2b `pageLayoutWidget` / `pageLayoutTab`: audit `title`/`position`/`configuration`/`gridPosition`/
  `conditionalDisplay`.
- 2c `view` / `viewField` / `viewFieldGroup`: audit remaining overridable flags.
- **Each PR ships its migrate/drop data migration atomically** (fast/slow instance command) so the
  routing flip and the migration of now-orphaned overrides land together — never a flip without its
  migration. Guarded by the A2a characterization test.
- **Deps:** PR1, and A2a (routing pinned). **Risk:** behavior change (workspace can no longer shadow a
  definition; edits reroute) → covered by tests in `08`.

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

### PR4 — Unify the two override mechanisms (L+, 2–3 wk, higher risk) → **expanded in [`12-unify-overrides.md`](./12-unify-overrides.md)**
- The two mechanisms are **not** just "two columns": `standardOverrides` is i18n-aware (per-locale
  `translations` + Lingui + `applicationCatalog`) and **GraphQL-exposed**, while `OverridableEntity.overrides`
  is a flat i18n-free spread. Unifying must promote the **superset** (one i18n-capable resolver), keep
  `standardOverrides` as a **deprecated GraphQL alias** during migration, and not flip object/field's
  `isActive` default.
- Sub-sequenced as **U0 (characterize/parity, riskless) → U1 (unified resolve+write, behavior-preserving)
  → U2 (registry-drive) → U3 (storage migration + alias) → U4 (reconciler collapse) → U5 (remove alias)**.
- **Deps:** PR1 (facet annotation), PR2 (authoritative facets). **Risk:** hot object/field resolve path +
  i18n + GraphQL surface → exact parity gate before any switch. Full detail, tests, and risks in `12`.

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

- **Validate before building (Phase −1).** The riskless ladder retires the scary risks and confirms the
  hypotheses with evidence before any behavior change. Non-negotiable first step.
- **Facet first, but split (PR1 inert → PR2 derive+migrate).** The facet annotation is the shared
  dependency of enforcement, managed mode, the manifest type, and the SDK — land it early as an inert
  annotation (PR1). The behavior-changing derivation + migration is a *separate*, characterization-guarded
  PR2, because `isOverridable` has live runtime effect (routing edits to the override blob).
- **Enforce before manage (PR3 before PR7).** Managed mode's guarantees are only trustworthy if the
  boundary is enforced; otherwise "managed" is advisory. PR3 also depends on **PR2** (honest facets) —
  enforcing over still-mislabelled facets would ship a known hole.
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

**Review-hardened estimate.** 18 top-level PRs (~22 mergeable units counting the PR2 split + PR3a) plus
the Phase −1 ladder. The earlier "9–14 weeks" was optimistic: **PR4** (unify overrides, hot object/field
path + data migration + retiring 4 resolvers + pre-refactor characterization) is realistically 2–3 wk;
**PR6** (`WorkspaceConfigSyncService` — genuinely engine-adjacent, not "thin sugar") 2–3 wk; **PR7** bundles
mode + guard + drift + `--dry-run` + audit and should split (PR7 mode+guard, PR7b plan/drift). Revised
total ≈ **14–20 engineer-weeks**, and that **excludes** Phase −1, the pre-refactor characterization suites
(`08` §G), and the two newly-added PRs below. These are planning estimates, not commitments; see `09`.

### Newly added PRs (orphans the review surfaced)
- **PR19 — Expose `managedByConfig` over metadata GraphQL + FE read-only affordance** on managed facets
  (M). Owns what doc 09 line 65 dangled onto PR18. Also verifies GraphQL **schema regen after apply**
  (fold into PR11 scope).
- **PR20 — Rollback support** (S): document + test "revert commit + `apply` returns to the prior effective
  state" (`08` D6). Forward-only, not snapshot restore.
- **Tracked separately (not in this roadmap):** reference-data-as-code (`defineFixtures`) spike — flagged
  in `09` §C; schedule with the customer, do not silently drop.

### Critical path (corrected)
The true long pole is **PR1 → PR2 → PR4 → PR6 → PR7**. The two "parallel" tracks converge on this spine, so
the second engineer should pick up PR5/PR8 (which need only PR1/PR5) while waiting on PR4/PR6 — not PR7.
