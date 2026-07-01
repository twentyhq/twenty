# 11 — De-risking First: The Riskless Validation Ladder

The adversarial review (see the findings folded into `03`, `08`, `09`) proved that some of the
"obvious first PRs" are not safe: `isOverridable` has real runtime behavior, the enforcement guard
contradicts an existing helper (`isCallerOverridingEntity`), uninstall is a destructive
`DROP TABLE … CASCADE`, and a mis-scoped reconcile could delete users' personal views. So we do **not**
open with the load-bearing refactor.

Instead we climb a ladder of **inert / read-only / test-only** PRs. Each one is reversible and cannot
change production behavior, and each is designed to **confirm or refute one hypothesis** the whole plan
rests on. The output of the ladder is *evidence + pinned invariants*, after which the behavior-changing
work (deriving overridability, the guard, override unification, managed mode) proceeds on solid ground.

## The hypotheses we're testing

| # | Hypothesis (the intuition) | If false, we learn… |
|---|----------------------------|---------------------|
| **H1** | Every metadata property classifies cleanly into one facet (definition/activation/arrangement/presentation) | the model is hand-wavy; needs rework before anything |
| **H2** | Today's `isOverridable` flags are inconsistent / leak definitions (the "smell" is real) | the "principled facet" premise is overstated |
| **H3** | The existing universal-flat-entity engine can reconcile the *workspace-owned* layer as code, cross-instance, via a **separate** config identity | the reconciliation story needs new engine work, not reuse |
| **H4** | Managed mode is safe if scoped correctly (never touches user/personal data or definitions) | we must build heavier guardrails before managed mode is viable |
| **H5** | The `twenty-sdk/config` authoring DX is ergonomic and compiles to a coherent manifest | the API needs redesign before customers touch it |

## The ladder (all riskless; ordered)

### A0 — Ownership doc (`docs/APP_VS_WORKSPACE_OWNERSHIP.md`) · **riskless (doc only)**
The four-facet test, surfaces-as-commons, seed lifecycle, and the *invariants* the later PRs must
preserve. No code. It is the review rubric for A1 and the shared vocabulary. Confirms nothing
empirically; aligns the team.

### A1 — Inert `facet` annotation + characterization test · **THE keystone experiment · riskless**
- Add `facet` to **every** property in
  `all-entity-properties-configuration-by-metadata-name.constant.ts` as **pure metadata**. Do **not**
  derive `isOverridable` from it; leave the hand-set `isOverridable` authoritative and untouched.
- Add a test asserting `deriveOverridable(facet) === isOverridable` for every property, with an
  explicit `KNOWN_FACET_MISMATCHES` allow-list for the exceptions.
- **Why riskless:** `facet` is read by no runtime code; `isOverridable` behavior is unchanged. Fully
  reversible (delete a column of the constant).
- **What it confirms (H1, H2):** whether every property *can* be classified (if reviewers can't agree,
  H1 is in trouble — cheaply learned), and the merged `KNOWN_FACET_MISMATCHES` list **is** the
  evidence-backed, agreed inventory of definition-leaks (e.g. `commandMenuItem.engineComponentKey`,
  currently `isOverridable: true` yet a definition). A short list of "definition marked overridable"
  confirms the thesis; a long contested list refutes it. **The PR's diff is the experiment.**

### A2 — Characterization tests at the four hot spots · **riskless (tests only)**
Turn the scariest review findings into checked-in, reproducible facts and pin the invariants:
- **(a) Override routing.** Assert what `sanitizeOverridableEntityInput` routes to `overrides` vs the
  base row, per entity. Locks current behavior so the later derive-from-facet flip is provably scoped.
- **(b) `isCallerOverridingEntity`.** Assert that when the workspace-Custom app edits a *foreign*-owned
  entity's overridable property, the edit becomes an **override, not a block**. Documents the existing
  policy our future guard must *reconcile with* (not contradict) — the reviewer's cross-cutting warning.
- **(c) Uninstall-with-records.** Install a fixture app + object, insert a record, uninstall → assert
  the table/records are dropped (`DROP TABLE … CASCADE`). Converts a hypothesized data-loss risk into a
  proven, reproducible one and defines the guard we must add before any managed-mode reconcile.
- **(d) Personal-view containment.** Create a personal view (Custom app, `createdByUserWorkspaceId`
  set); run the standard-app sync → assert it **survives** (containment via applicationId scoping); then
  as a negative control, run a deletion-inferring diff scoped to the Custom app with an empty target →
  assert it *would* be deleted. Proves the containment is only indirect scoping, pinpointing exactly the
  guardrail to build (dedicated config app + `createdByUserWorkspaceId`/`visibility` exclusion).
- **Why riskless:** tests only. **What it confirms (H4):** where the guardrails must go, with proof.

### A3 — Read-only `plan` / `--dry-run` over an existing app · **near-riskless (read-only, flag-gated)**
Expose the diff the sync engine *already computes* (compute maps → diff) and print it **without calling
apply**. No writes.
- **Why low-risk:** read-only path behind a flag; nothing is applied.
- **What it confirms (H3, partial):** that the existing engine yields a **legible, correct** diff on a
  real app — the foundational GitOps primitive. If the diff is unreadable or wrong, we learn the
  plan/apply story needs work before investing in the config layer.

### A4 — `twenty-sdk/config` types + compiled example, **no server apply** · **riskless (pure SDK)**
Ship the `define*` config types (facet-filtered projections of the real manifest types),
`resolveEffectiveConfig` (pure base⊕overlay merge), and `twenty config validate` (build-time only:
facet-check + dangling-ref check). Author `examples/bayer-twenty/` and run `validate`.
- **Why riskless:** pure types + a validate command; zero server change.
- **What it confirms (H5):** the authoring ergonomics and that configs compile to a coherent
  `WorkspaceConfigManifest`. Forces the merge-semantics decision (deep-merge vs replace) to be made
  concretely and tested, before any apply exists.

### A5 — Sandbox apply spike against a **throwaway config app**, integration-test only · **riskless (test DB)**
In an integration test (nothing shipped/flagged), mint a dedicated `workspaceConfigApplication`
identity (distinct from `workspaceCustomApplication`), compile a small manifest (rename Company →
Organization, reorder a tab, place a cross-app widget), apply it via the existing engine, and assert:
effective metadata is correct **and** personal views + definitions are untouched.
- **Why riskless:** contained to a test database; no shipped code path.
- **What it confirms (H3 + H4, end-to-end):** the engine can apply the workspace-owned layer through a
  separate config identity without touching user/definition data. Highest-signal experiment, still
  riskless because it lives in a test.

## Risk ↔ retirement map

| Adversarial finding | Retired/located by |
|---------------------|--------------------|
| "PR1 is a no-op" false (`isOverridable` is live) | A1 (keeps it hand-set; only annotates) + A2a (pins routing) |
| Guard contradicts `isCallerOverridingEntity` | A2b (pins existing policy the guard must match) |
| Uninstall = destructive cascade | A2c (proves it; scopes the needed guard) |
| Managed reconcile could delete personal views | A2d + A5 (proves containment; validates dedicated config app) |
| Overrides are anonymous / no attribution | A4/A5 (surface whether single-layer overrides suffice for the target use cases) |
| `workspaceCustomApplication` conflation | A5 (validates a *distinct* config app before committing) |

## The decision gate

After the ladder we have, at near-zero risk: an agreed facet map + the real leak inventory (A1),
pinned invariants and proven risks at every hot spot (A2), a working read-only plan (A3), a validated
authoring surface (A4), and a sandbox end-to-end apply through a dedicated config identity (A5).

**Only then** do we start the behavior-changing PRs — and each begins from a pinned characterization
test:
- Derive `isOverridable` from facet **+ ship the migrate/drop data migration atomically** (the honest
  PR2), guarded by A2a.
- The facet-gated mutation guard that **reuses `isSystem`/`isSystemBuild` and composes with**
  `isCallerOverridingEntity` (not an `applicationId`-equality gate), guarded by A2b.
- Override unification, guarded by A2a's characterization.
- Managed mode + drift, built on A2c/A2d's guardrails and A5's dedicated config app.

If any rung refutes its hypothesis, we've learned it for the price of a constant, a few tests, or a
read-only flag — not a hot-path refactor or a data migration. That is the point of the ladder.
