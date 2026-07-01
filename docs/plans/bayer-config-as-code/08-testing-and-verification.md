# 08 — Testing & Verification

Testing has two jobs here: (1) prove the system is **correct and safe** (ownership invariants,
idempotency, drift), and (2) produce the **evidence** a regulated customer needs (CSV / 21 CFR Part
11). Both are designed in, not bolted on.

Follow the repo's test pyramid (70% unit / 20% integration / 10% e2e) and conventions (query by
behavior, `jest.clearAllMocks()`, descriptive `should … when …` names).

---

## A. Invariants to protect (the spec the tests encode)

These are the properties that must never regress. Each maps to tests below.

1. **Ownership.** No app can create/update/delete a `definition`-facet property of an entity it does
   not own; the workspace layer can never write a `definition` facet. (→ B2, C1)
2. **Additivity.** The only legal way to touch a foreign object is to *add* a component attributed to
   the caller. (→ C1)
3. **Facet↔overridability derivation.** `isOverridable(property) === isOverridableFacet(facet(property))`
   for every property; no drift possible. (→ B1)
4. **Idempotency.** `apply(commit)` twice ⇒ the second `plan` is empty. (→ D2)
5. **Determinism / portability.** Same commit applied to two fresh instances ⇒ identical effective
   metadata (modulo per-instance UUIDs). (→ D3)
6. **Managed authority.** On a managed instance, a UI edit to a managed workspace facet is rejected;
   a live divergence is reported as `managed-drift` and reverted on apply. (→ C2, C3)
7. **Composition.** `base ⊕ overlay` and the layer precedence (`03` §E.4) resolve exactly as
   specified, including `{remove:true}` deletions and version-pin overrides. (→ B3)
8. **No foreign-definition writes on apply.** Every `apply` plan reports zero foreign-definition
   changes unless it is an app upgrade owned by that app. (→ C3, D1)

---

## B. Unit tests (fast, most numerous)

### B1 — Facet registry & derivation
- Every property in `ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME` has a `facet` (type-level
  test + a runtime completeness test iterating all metadata names).
- `isOverridable` derived value matches `isOverridableFacet(facet)` for all properties.
- Tiebreaker properties (those whose facet isn't obvious) carry a non-empty `facetRationale`.
- Snapshot test of the full facet map so any classification change is a visible, reviewed diff.

### B2 — `assertMutationAllowed` (pure guard logic)
Table-driven over `{callerKind, callerApp, targetApp, facet, operation, mode}` → allow/deny, covering:
- app editing own definition (allow) / foreign definition (deny),
- workspace-config writing presentation/arrangement/activation (allow),
- `ui` writing a managed workspace facet (deny) vs self-serve (allow),
- additive foreign create attributed to caller (allow), foreign delete (deny unless surface/owner).

### B3 — `resolveEffectiveConfig` (base ⊕ overlay) & layer composition
- Scalar override, collection merge-by-id, `{remove:true}`, install-set version override.
- Layer precedence: standard-app < apps < base < overlay; higher layer may only set workspace facets;
  a `definition` set from a higher layer throws.
- Property-based test: merge is associative for disjoint keys and last-wins for conflicts.

### B4 — `resolveEffectiveEntity` (unified overrides)
- Base + overrides + `isActive` → effective entity, for object/field (post-unification) and for
  view/layout entities, proving the *single* resolver reproduces the old per-entity behavior
  (characterization tests captured before PR4).

---

## C. Integration tests (server + DB; extend existing `test/integration/metadata/suites/application`)

### C1 — Ownership enforcement end-to-end
- App A owns object X. App B: add field to X (succeeds, field attributed to B); update X's
  `nameSingular` (rejected); delete B's own field (succeeds); delete A's field (rejected).
- Builds on the existing `successful-resync-application-with-cross-app-owned-view-field` suite.

### C2 — Managed mode UI lock
- Put instance in `managed`; attempt a GraphQL mutation of a managed `presentation`/`arrangement`/
  `activation` facet from a `ui` caller → typed rejection. Same mutation on a `self-serve` instance →
  succeeds.

### C3 — Workspace-config sync + drift
- Apply a `WorkspaceConfigManifest` (rename Company→Organization, reorder a tab, disable a view,
  place a cross-app widget). Assert effective metadata.
- Mutate the live instance out-of-band (flip an `isActive`), run `plan` → exactly one `managed-drift`
  line; `apply` → drift reverted; re-`plan` → empty.
- Assert **zero** `definition` changes in the apply plan.

### C4 — Composition across apps + overlays
- Install core + country-de on "prod-eu"; core only on "prod-us". Assert the DE widget/objects exist
  on eu and are absent on us. Assert an EU-only presentation overlay applies only to eu.

### C5 — Upgrade lifecycle
- App ships v1 with seed defaults; workspace diverges a facet as code; app upgrades to v2 changing a
  `definition` and its seed. Assert: definition updated; workspace-owned facet preserved (not
  clobbered); a brand-new install gets the v2 seed.

---

## D. End-to-end / system tests (10%)

### D1 — `plan` fidelity
- For a known repo state + known live state, `twenty config plan` output equals a golden structured
  diff; markdown rendering matches a snapshot. Assert the "foreign-owned definitions touched: 0" line.

### D2 — Idempotency
- `apply` a commit to a fresh instance; `plan` again → empty. Apply again → no-op. Automated in CI.

### D3 — Determinism / DR rebuild (PR17)
- Spin up a fresh instance; `apply` a pinned commit; snapshot effective metadata (universal form).
  Spin up a second fresh instance; apply the same commit; assert the two snapshots are identical.
  This is simultaneously the **disaster-recovery** and **reproducibility/CSV** test.

### D4 — Promotion
- `promote --from staging --to prod-eu` bumps pins, opens the PR, and a subsequent `apply` reaches the
  intended state; `prod-us` unaffected.

### D5 — Secrets round-trip (PR14)
- SOPS-encrypted secret → decrypt in CI → `applicationVariable{isSecret:true}` present, value never in
  plan output or logs (assert redaction).

---

## E. Regulatory verification (evidence, not just correctness)

### E1 — Audit record completeness
- Every `apply` writes an audit entry with `{commitSha, instance, actor, approver?, perEntityDiff,
  timestamp}`. Test that the entry is present and complete for each apply.

### E2 — Evidence export (PR15)
- `twenty config evidence --instance prod-eu --since <date>` yields a CSV whose rows reconcile 1:1 with
  the Git commits + CI applies in the window. Test the reconciliation (no missing/extra rows).

### E3 — Separation-of-duties gate
- A promotion to a protected environment requires a reviewer distinct from the author; test the CI
  gate rejects self-approval.

### E4 — "Rebuild == validated state"
- D3's determinism test is the CSV/computer-system-validation evidence that a rebuilt instance equals
  the validated configuration.

---

## F. Performance & scale checks

- **Plan/apply at scale.** Synthetic estate (e.g. 50 objects × 40 fields × 10 views × N apps) —
  assert `plan` completes within a target wall-clock and memory bound; the diff is O(changed), not
  O(total). (Leverage the existing flat-entity map-cache services.)
- **Many instances fan-out.** `plan --instance all` across 10+ instances parallelizes and stays within
  CI time budget.
- **Upgrade migration cost.** The PR2 data migrations run within the instance-command budget on a
  large workspace.

---

## G. Test data & fixtures

- Reuse the SDK CLI test apps (`minimal-app`, `rich-app`) as fixtures; add a `bayer-fixture` app pair
  (core + one country) exercising cross-app placement.
- Golden files for `plan` output live next to the e2e tests and are reviewed on change.
- Characterization tests captured **before** PR4/PR2 lock in current resolve/override behavior so the
  refactors are provably behavior-preserving.

---

## H. Definition of done (per the success criteria in `00`)

A capability is "done" when its invariants (§A) are covered at the right pyramid level, the golden
`plan`/evidence snapshots exist, and the determinism (D3) and idempotency (D2) system tests pass in
CI. M6 additionally requires E1–E4 green.
