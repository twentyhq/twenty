# 09 — Risks & Open Questions

Honest inventory of the decisions still to make, the risks, and the mitigations. Each **decision**
has a recommendation; each **risk** has a mitigation. Nothing here blocks starting Phase 0.

---

## A. Decisions needed (with recommendations)

### D1 — Unify overrides: B1 (extend `OverridableEntity`) vs B2 (facet-typed `standardOverrides`)
- **B1:** object/field extend `OverridableEntity`; migrate `standardOverrides` → `overrides`. One base
  class, one resolver, cleanest end-state.
- **B2:** keep `standardOverrides` but redefine it as a facet-typed projection the shared resolver
  understands. Smaller migration, but leaves two column names.
- **Recommendation: B1**, gated on a characterization-test safety net (`08` B4/C-suite) because it
  touches the hot object/field resolve path. Fall back to B2 if migration risk proves too high for the
  timeline.

### D2 — Monorepo vs polyrepo for the customer estate
- **Monorepo** (recommended): colocation, atomic cross-cutting PRs, one `plan`. Apps still published as
  versioned artifacts so promotion pins immutable versions. CODEOWNERS draw team lines.
- **Polyrepo:** apps in their own repos, a central config repo pins versions. Better for fully
  independent country-team autonomy, worse for colocation and atomic review.
- **Recommendation: monorepo + published app artifacts.** Revisit if a country org demands a hard repo
  boundary.

### D3 — Managed-mode granularity
- Per-instance flag vs per-entity `managedByConfig` (derived from whether the workspace-config declares
  the entity).
- **Recommendation:** instance-level `mode` *plus* per-entity `managedByConfig`, so an instance can be
  "managed for the estate apps" while leaving an explicit sandbox object un-managed. Avoids an
  all-or-nothing cliff that would block adoption.

### D4 — Secrets tooling
- SOPS(+age/KMS) vs sealed-secrets vs external Vault reference.
- **Recommendation: SOPS with KMS** for the file-in-Git model (matches the repo-as-source-of-truth
  goal), with an **optional Vault `secretRef` resolver** for customers who mandate a central secret
  store. Keep the `secretRef` indirection so the backend is swappable.

### D5 — App registry / artifact hosting
- Where do published app versions live (npm registry, an internal registry, or Git tags + build)?
- **Recommendation:** support both `sourceType: npm` (internal registry) and a build-from-pinned-Git
  path; Bayer likely wants an internal registry for provenance. Decide with their platform team.

### D6 — Tiebreaker facet assignments
- `commandMenuItem.availabilityType` / `availabilityObjectMetadataId` / `pageLayoutId`;
  `pageLayoutWidget.conditionalDisplay` / `conditionalAvailabilityExpression`.
- These are genuine "binding vs identity" calls. **Recommendation:** default to `definition` (app owns
  what its command/widget *does* and *targets*), allow the workspace to *narrow* via `activation`/
  conditional visibility, and record a `facetRationale` for each. Re-evaluate with real customer use
  cases; the facet registry makes changing one a visible, reviewed diff.

---

## B. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **PR4 (unify overrides) regresses the hot object/field path** | Med | High | Characterization tests captured pre-refactor; land behind the facet work; B2 fallback |
| **Facet misclassification breaks a workspace's existing override on upgrade** | Med | Med | PR2 data migrations decide migrate-vs-drop per property; snapshot diff reviewed; staged rollout |
| **Managed mode surprises self-serve users** (UI suddenly read-only) | Low | High | Default remains **self-serve**; managed is opt-in per instance; clear typed error + link to repo |
| **`universalIdentifier` collisions / mint governance across teams** | Med | Med | Central allocation convention + a `validate` check for duplicates; generator in the SDK |
| **Non-transactional apply leaves an instance half-updated** | Med | High | Apply within the existing migration transaction where possible; on partial failure, `plan` shows the remaining delta and apply is resumable/idempotent |
| **Rollback expectations** (customers expect "undo") | Med | Med | Rollback = revert the commit + `apply`; document that apply is forward-only and idempotent, not a snapshot restore |
| **Front-end unaware of managed/locked state** | Med | Med | Surface `managedByConfig` in metadata GraphQL so the UI can show read-only affordances (a small FE follow-up, noted in `07` PR18) |
| **GraphQL schema regen / caching after apply** | Med | Med | Reuse the existing post-sync schema-refresh path the app install already triggers |
| **Scale: plan/apply on very large estates** | Low | Med | Diff is O(changed) via flat-entity map caches; perf tests in `08` §F |
| **Secret leakage into plan output/logs** | Low | High | Redaction test (`08` D5); `secretRef` never resolves values into plan; CI log scrubbing |
| **Two customers, two modes drift the codebase** | Low | Med | Managed vs self-serve share one engine; only the authority table (`03` §A.3) differs — single code path, flag-driven |

---

## C. Explicitly out of scope (and where they'd go)

- **Record-level data / fixtures.** Managing actual CRM rows (reference data, seed records) is a
  separate system. A future `defineFixtures` could ride a similar apply path but with data-merge
  semantics and PII/regulatory implications; **not** in this plan. Flag it early with Bayer — they may
  expect reference-data-as-code too.
- **Per-user preferences.** A single user's personal view tweaks stay user-scoped; the managed layer is
  workspace-scoped. The precedence (user > workspace-managed?) needs a product call if managed mode
  should be able to *lock* user overrides too — likely yes for some views, no for others.
- **Cross-instance data replication / migration.** Moving records between instances is unrelated.
- **Non-metadata org settings** not represented as metadata entities (if any) would need Metadata-API-
  style coverage; audit whether any Bayer-required setting falls outside the current entity model.

---

## D. Assumptions to validate with the customer

1. Every configuration surface Bayer needs is representable by an existing metadata entity (objects,
   fields, views, layouts, command menu, navigation, roles, functions, connection providers, variables,
   translations). **Action:** run a coverage workshop against their real requirements; file gaps as new
   manifest entities.
2. They want **reference-data-as-code** too (see out-of-scope). If yes, scope a follow-on.
3. Their compliance team accepts **Git history + CI logs + server audit** as the change-control and
   Part-11 record. **Action:** validate the evidence export format (`08` E2) with QA/validation early.
4. Instance topology: how many instances, per-region vs per-tier, and who administers each. **Action:**
   confirm the environment registry shape and CODEOWNERS boundaries.
5. Secret-store mandate (SOPS-in-Git acceptable, or Vault required?). Drives D4.

---

## E. Sequencing risks

- **Don't ship managed mode (PR7) before enforcement (PR3).** "Managed" is only trustworthy if the
  boundary is enforced; shipping the reverse order creates a false sense of safety.
- **Don't let the SDK config layer (PR8) get ahead of the server capability (PR6/7).** The SDK must
  call a real engine, not stub semantics that later diverge.
- **Facet registry (PR1) is on the critical path for almost everything** — protect its schedule; it is
  low-risk but high-leverage.

---

## F. Success re-check

Revisit the ten success criteria in `00-vision-and-north-star.md` at each milestone. The plan is
"perfect enough to build" when: the invariants in `08` §A are the agreed spec, D1–D6 have owners, and
the out-of-scope items (esp. reference-data-as-code) are explicitly accepted or scheduled by the
customer. Remaining unknowns are customer-input items (§D), not architectural blockers.
