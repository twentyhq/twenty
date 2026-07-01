# 03 — Target Architecture (Server-Side)

This document specifies the server/shared-package changes that turn today's emergent model into
the enforced, managed, reconcilable system the end-state requires. Each section maps to gaps in
`02-current-state-analysis.md` and to PRs in `07-implementation-roadmap.md`.

Design constraints (from `README.md`): one reconciliation engine, identity via
`universalIdentifier`, additive-never-in-place, everything auditable/reproducible.

---

## A. The Facet Registry (closes G1)

### A.1 Replace the ad-hoc binary with a required facet

In `ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME`, add a required `facet` to every
property and **derive** overridability from it.

```ts
// flat-entity/types/facet.type.ts
export type MetadataFacet =
  | 'definition'    // app-owned; upgrade overwrites; not workspace-writable
  | 'activation'    // workspace-owned; the isActive column
  | 'arrangement'   // workspace-owned; placement/order/grouping
  | 'presentation'; // workspace-owned; label/icon/color/translations

// Ownership + overridability are DERIVED, never hand-set:
export const WORKSPACE_OWNED_FACETS = ['activation', 'arrangement', 'presentation'] as const;
export const isOverridableFacet = (f: MetadataFacet) =>
  f === 'arrangement' || f === 'presentation';        // activation uses isActive, not overrides
```

Registry entry shape becomes:

```ts
type MetadataEntityPropertyConfiguration<TMetadataName> = {
  [K in ...]: {
    facet: MetadataFacet;                 // NEW — required
    facetRationale?: string;              // NEW — required IFF this property is a tiebreaker
    universalProperty: ...;               // unchanged
    toStringify: ...;                     // unchanged
    toCompare: boolean;                   // unchanged
    // isOverridable is now DERIVED from facet — remove the hand-set field
  };
};
```

- `isOverridable` (and `MetadataEntityOverridablePropertyName`) are recomputed from `facet` so the
  two can never drift.
- A property with no `facet` fails to compile — this is what **forces every new column through the
  four-way test** and stops the debates from recurring.

### A.2 Fix the misclassifications the facet lens exposes (G1 cont.)

The migration from binary → facet surfaces bugs as a typed list. Known ones (from
`01-ownership-model.md`):

- `commandMenuItem.engineComponentKey` → `definition` (currently overridable — a Definition leak).
- Reconcile `commandMenuItem.availabilityType` vs `conditionalAvailabilityExpression` (one
  overridable, one not, no reason) — decide via the tiebreaker test and record `facetRationale`.
- Audit `pageLayoutWidget` (`title`=presentation, `position`/`pageLayoutTabId`=arrangement,
  `configuration`/`gridPosition`/`type`=definition, `conditionalDisplay`=behavior→definition).

Each fix ships with a fast/slow instance command to **migrate or drop** any existing override that
sat on a now-`definition` property (data-migration decision recorded per property).

### A.3 The facet drives reconciliation authority

The reconciler consults the facet to decide who wins on a per-property basis:

| Facet | Managed instance | Self-serve instance |
|-------|------------------|---------------------|
| `definition` | repo (app) wins; upgrade overwrites | app wins on upgrade |
| `activation` | repo (`workspace/**`) wins | workspace/UI wins |
| `arrangement` / `presentation` | repo (`workspace/**`) wins | workspace/UI wins (seed only) |

This single table is the semantic core of managed mode (§D).

---

## B. Unify the two override mechanisms (closes G2)

Today object/field Presentation lives in a bespoke `standardOverrides` JSONB; everything else uses
`OverridableEntity.overrides`. Target: **one** override concept, facet-typed.

> **Review-hardened.** Both `standardOverrides` and `overrides` are **anonymous single-slot JSONB blobs
> on the target row**, keyed only by property name, with **no owner/actor/applicationId** — strictly
> last-writer-wins per property (`resolve-*-standard-override.util.ts`, `sanitizeOverridableEntityInput`).
> Consequences the plan must accept: (a) you **cannot** attribute an override to a specific app, nor do a
> per-app 3-way merge, from stored data alone; (b) drop any "override attributed to the config app"
> language — attribution comes from the **audit trail of who applied**, not the row. If genuine
> multi-contributor layering (app-seed ⊕ workspace ⊕ …) is ever required, that is **real schema work**
> (an ordered, owner-tagged override structure + resolver rewrite), **not** the "lighter B2 projection" —
> size it honestly. For managed instances the single-slot blob is sufficient *because the config app is
> the sole author*.

Two acceptable implementations (decision recorded in `09-risks-and-open-questions.md`):

- **B1 (preferred): make `ObjectMetadataEntity`/`FieldMetadataEntity` extend `OverridableEntity`**
  and migrate `standardOverrides` content into `overrides`, tagged by facet. One base class, one
  resolve path.
- **B2 (lighter): keep `standardOverrides` but redefine it as a facet-typed projection** that the
  shared resolver understands, so the merge semantics are identical even if the column name differs.

Either way, introduce **one** resolver:

```ts
// flat-entity/utils/resolve-effective-entity.util.ts
resolveEffectiveEntity(base, overrides, isActive, { facetsByProperty }): EffectiveEntity
```

replacing the per-entity resolvers (`resolve-object-metadata-standard-override.util.ts`,
`page-layout-widget.resolver.ts`, `view.resolver.ts`, …). Merge semantics live in exactly one place.

---

## C. Enforcement at the mutation boundary (closes G3)

> **Review-hardened.** The original draft proposed an `applicationId`-equality gate
> ("Definition writable only when `caller.applicationId === target.applicationId`"). That is **wrong**
> and would break core Twenty behavior, for three verified reasons:
> 1. **No caller-application identity exists for UI traffic today.** Metadata resolvers use
>    `@AuthWorkspace()` + `SettingsPermissionGuard(DATA_MODEL)` and never read a caller app;
>    `authContext.applicationId` is populated only for app-issued OAuth tokens.
> 2. **On create there is no `target.applicationId`** — the owner is *assigned*, defaulting to
>    `workspaceCustomApplication` (`object-metadata.service.ts`, `ownerFlatApplication ?? workspaceCustom…`).
> 3. **Custom-field-on-standard-object deliberately mismatches ids** — the field's `applicationId` is
>    the workspace-Custom app while the parent object's is `twentyStandardApplication`
>    (`get-default-flat-field-metadata-from-create-field-input.util.ts`). An equality gate forbids this
>    core feature.
>
> Twenty **already** has the relevant policy engine: `isCallerOverridingEntity`
> (`callerApplicationUniversalIdentifier` vs `entityApplicationUniversalIdentifier` vs the Custom app,
> plus `isSystemSideEffect`) routes a workspace edit of a *foreign*-owned **overridable** property into
> the `overrides`/`standardOverrides` blob — it does **not** block it. The guard must *compose with* this,
> not contradict it.

**Corrected model.** The guard is **facet-gated**, reuses the existing `isSystem` / `isSystemBuild`
signals (the real enforcement axis today, in `flat-*-metadata-validator.service.ts`), and treats
create/update/delete distinctly:

```ts
// pseudo — facet-gated, not applicationId-equality
assertMetadataMutationAllowed({
  caller:  { kind: 'app' | 'workspace-config' | 'ui' | 'system', applicationId?, instanceMode },
  target:  { applicationId, isSystem, facetOf(property), createdByUserWorkspaceId? },
  operation: 'create' | 'update' | 'delete',
}): 'allow' | 'route-to-override' | 'deny'
```

Rules:

1. **Create** — always owner-*assigned*, never owner-*compared*. A `ui`/`app` create is allowed and the
   new row is stamped to the caller's application (`ui` → `workspaceCustomApplication`; app → that app;
   config → the dedicated config app, §E.1). Adding a component onto a *foreign* object is a create of a
   new attributed row — the legal, existing cross-app path.
2. **Update of a `definition`-facet column of a foreign/`isSystem` entity, in place →** `deny`. This is
   the one genuinely new restriction: no caller may rewrite another owner's *definition*. (An app
   updating *its own* definition, or `isSystemBuild` sync, is allowed.)
3. **Update of an `arrangement`/`presentation`-facet column of a foreign entity →** `route-to-override`
   (the **existing** `isCallerOverridingEntity` behavior) when the caller may override on this instance;
   on a **managed** instance a `ui` caller is `deny` (§D), a `workspace-config` caller is allowed.
4. **Update of `activation` (`isActive`)** — same routing as (3) but into the `isActive` column, not the
   override blob.
5. **Delete** — allowed for the owner; for a *placement/override* authored by the workspace layer, the
   workspace-config caller may delete; a `ui` delete of a managed entity is `deny`; **never infer-delete a
   row with `createdByUserWorkspaceId` set** (user data — see §D.2 and the uninstall guard §I).

Precursors: (PR3a) thread a caller-attribution context into the metadata mutation path (it does not exist
today); pin the current `isCallerOverridingEntity` + `isSystem` behavior with the A2b characterization
test before changing anything (`11`/`08`).

---

## D. Managed mode + drift (closes G4)

### D.1 Instance mode

Add an instance-level `mode: 'self-serve' | 'managed'` (stored on the workspace/instance record,
set by the config apply). Managed mode changes three behaviours:

1. **UI lock.** The metadata GraphQL mutation guard (§C) rejects `ui`-origin writes to
   `activation`/`arrangement`/`presentation` facets of **managed** entities, with a typed error
   ("This instance is managed as code; edit via the config repository"). Definitions are already
   app-only.
2. **Reconciliation authority.** Per §A.3, the repo wins for all facets on managed instances.
3. **Drift is meaningful.** Because the repo is authoritative, any divergence is drift to report.

Granularity: managed-ness is per *entity set* — an instance can be managed for the
central+country apps while leaving a small "sandbox" object un-managed. Implementation: a
`managedByConfig: boolean` derived from whether the workspace-config artifact declares the entity.

### D.2 Drift detection & reconciliation

Drift = `effective(live instance) ≠ effective(repo)` for any managed, comparable property. The
reconciler already computes this diff (it *is* the `plan`). Add:

- **`twenty deploy --dry-run` (plan mode).** Compute the universal-flat-entity maps from the repo,
  compute them from the live instance, diff, and emit a structured, human-readable report **without
  applying**. This is the PR-time artifact and the nightly drift job (G7).
- **Drift classification.** Each diff line is tagged: `managed-drift` (repo authoritative → will be
  reverted on apply), `definition-change` (app upgrade), or `unmanaged` (ignored). Only
  `managed-drift` blocks/alerts.
- **Reconcile on apply.** `twenty deploy` (no `--dry-run`) applies the repo state, reverting
  managed drift. Idempotent: a second apply of the same commit is a no-op.

### D.3 Audit hooks

Every apply writes to the existing Setup-audit trail with: the commit SHA, the instance, the
actor (CI service identity), and the per-entity diff. This is the machine half of the Part 11
evidence in `08`.

---

## E. The Workspace-Config Artifact (closes G5)

### E.1 Concept: the workspace layer is a **dedicated config application**, authored as code

> **Review-hardened.** An earlier draft reused `workspaceCustomApplication` as the config identity.
> That is unsafe: `workspaceCustomApplication` already owns **every UI-created custom object/field and
> every user's personal view/nav item** (personal views carry `applicationId = workspaceCustomApplication`
> + `createdByUserWorkspaceId`). A repo→live reconcile scoped to that app with deletion-inference would
> treat every user artifact absent from the repo as a deletion — silent user-data loss. Today personal
> views survive only because no deletion-inferring sync targets the Custom app; making it the config
> identity removes that accidental protection.

The target introduces a **dedicated `workspaceConfigApplication`** (per instance, `canBeUninstalled:
false`), *distinct from* `workspaceCustomApplication`, that:

- **depends on** the installed apps (`core`, `country-*`),
- **owns** the workspace-facet state: `activation` (isActive), `arrangement` (placements/order — incl.
  net-new placement rows it *creates*, e.g. a cross-app widget on a foreign surface), and `presentation`
  (labels/icons/colors/translations, written into the target row's override blob),
- carries the **install set** (which apps@version) and **env values** (`applicationVariable`s,
  `connectionProvider`s).

This reuses the existing pipeline: the workspace-config compiles to a **Manifest-like universal-flat-entity
map** and is diff/applied by the same engine as any app. **Two hard constraints the reconcile must honor:**
(1) deletion-inference for the config app must be a **positive allow-list** of entities the config
declares, and must **exclude any row with `createdByUserWorkspaceId` set** (and non-`WORKSPACE`
visibility) so personal/user artifacts are never reverted or deleted; (2) `presentation`/`arrangement`
overrides are stored as an **anonymous single-slot blob on the target row** (see §B) — on a *managed*
instance the config app is the *sole* author of that blob, which is what makes "repo is authoritative"
well-defined without a per-contributor owner column.

### E.2 New shared type: `WorkspaceConfigManifest`

A sibling to `Manifest` (twenty-shared) capturing the workspace-owned layer:

```ts
// twenty-shared/src/application/workspaceConfigManifestType.ts  (NEW)
export type WorkspaceConfigManifest = {
  instance: {
    universalIdentifier: string;         // stable instance id
    name: string;                        // 'prod-eu'
    tier: 'dev' | 'staging' | 'prod';
    region?: string;
    mode: 'self-serve' | 'managed';
  };
  install: Array<{ applicationUniversalIdentifier: string; version: string }>;
  activation: Array<{ targetUniversalIdentifier: string; isActive: boolean }>;
  arrangement: Array<ArrangementOverride>;   // page-layout-tab/widget, view-field, command-menu, nav
  presentation: Array<PresentationOverride>; // object/field/view/command labels, icons, colors, i18n
  values?: Array<{ applicationUniversalIdentifier: string; key: string; value: string; isSecret?: boolean }>;
  connectionProviders?: Array<...>;          // per-instance, secret
};
```

- `arrangement`/`presentation` entries are **facet-typed override records** keyed by
  `targetUniversalIdentifier` — they compile to the `overrides` (or `standardOverrides`, per §B) blob on
  the target entity. The blob has no owner column; on a managed instance the config app is its sole
  author, and provenance is the apply audit record (§D.3), not a row field.
- The reconciler validates every entry against the facet registry: an `arrangement` entry may only
  set `arrangement`-facet properties, etc. Setting a `definition` property from the workspace config
  is a **build/plan-time error** (this is the enforcement of §C at authoring time).

### E.3 New service: `WorkspaceConfigSyncService`

Mirrors `ApplicationSyncService` but for the workspace layer:

```
resolveEffectiveConfig(base, overlay)                       // base ⊕ overlay (§F)
  → computeWorkspaceConfigUniversalFlatEntityMaps(effective)// like compute-application-manifest-…-maps
  → diff vs live instance (facet-aware, managed-aware)      // reuse workspace-migration-builder
  → apply (or report, if --dry-run)                         // reuse workspace-migration-runner
```

It runs **after** app install/upgrade in a deploy, because it layers over app-provided seeds.

### E.4 Composition order (deterministic layering)

For a given instance, the effective metadata is computed by composing layers in a fixed precedence
(lowest to highest):

```
1. twenty-standard-application  (Twenty's own standard objects/fields — definitions + seeds)
2. installed apps @pinned version, in dependency order (core, then country-*) — definitions + seeds
3. workspace-config base        (activation/arrangement/presentation shared by all instances)
4. workspace-config overlay     (per-instance deltas)
```

Higher layers may only set **workspace-owned facets** on entities defined by lower layers (enforced
by §C/§E.2). Definitions come solely from layers 1–2. This ordered composition is what makes an
instance a deterministic function of pinned Git state (success criterion #2).

---

## F. base ⊕ overlay resolution

`resolveEffectiveConfig(base, overlay)` merges the workspace-config layers by
`targetUniversalIdentifier` + property:

- **Scalars/labels:** overlay value replaces base value.
- **Collections (e.g. arrangement/viewField lists):** match entries by `targetUniversalIdentifier`, then
  **deep-merge per property** — an overlay entry sets only the properties it names and *inherits* the
  rest from the matched base entry. `undefined` = inherit; explicit `null` = clear; `{ remove: true }`
  = delete the base entry. **Not** whole-entry replace.
  > **Review-hardened — this is the highest-value correctness fix.** Whole-entry "replace" is a silent
  > data-loss trap: an overlay bumping only a viewField's `size` would drop the base entry's `position`
  > and `isVisible`. Per-property deep-merge is mandatory; the example overlays (doc 06) only set full
  > objects, which hides the trap — the tests in `08` must cover the partial-override case explicitly.
- **Nested maps (e.g. `translations`):** deep-merge by locale then by key (an overlay's `de-DE.labelSingular`
  must not drop base `fr-FR` or base `de-DE.labelPlural`).
- **Install set:** overlay may pin/override versions and add/remove apps.
- Result is a single `WorkspaceConfigManifest` fed to §E.3.

Merge is pure and total (no side effects), so `plan` is trivially previewable and testable.

---

## G. End-to-end reconciliation (`plan` / `apply`)

```
twenty deploy --instance prod-eu [--dry-run]
  1. Load environments.ts → { url, tier, region, mode, auth } for prod-eu
  2. Build app manifests for install-set (twenty app build) OR resolve pinned published versions
  3. Load workspace-config: base ⊕ overlays/prod-eu  → WorkspaceConfigManifest
  4. Compose layers 1–4 (§E.4) → target universal-flat-entity maps
  5. Fetch live instance maps
  6. Facet-aware, managed-aware diff  → structured plan
  7. If --dry-run: emit plan (PR comment / drift report) and STOP
     Else: apply via workspace-migration-runner; write audit record (§D.3)
  8. Idempotency check: re-plan should be empty
```

Steps 4–7 reuse existing services; the new code is layer composition (§E.4), base⊕overlay (§F),
the workspace-config manifest/sync (§E), plan mode (§D.2), and the guard (§C).

---

## H. Data-model changes (summary)

| Change | Kind | Anchor / new file | PR |
|--------|------|-------------------|----|
| `facet` (+`facetRationale`) on property registry; derive `isOverridable` | shared/types | `all-entity-properties-configuration-by-metadata-name.constant.ts`, `facet.type.ts` (new) | PR1 |
| Facet misclassification fixes + data migrations | instance cmds | per-entity migrations under `upgrade-version-command/**` | PR2 |
| Caller-attribution context + mutation guard | server | `object-metadata.service.ts` + mutation path; new guard | PR3 |
| Unify overrides (`OverridableEntity` for object/field or facet-typed `standardOverrides`) | server | object/field entities + one resolver | PR4 |
| `WorkspaceConfigManifest` type + converters | shared | `workspaceConfigManifestType.ts` (new) + `from-workspace-config-*` converters | PR5 |
| `WorkspaceConfigSyncService` + layer composition | server | new service beside `application-sync.service.ts` | PR6 |
| Instance `mode` + managed guard + drift/plan mode | server | workspace/instance record; `--dry-run` in deploy path | PR7 |
| Audit/evidence export on apply | server | Setup-audit hook + export command | PR15 |

All of it rides the existing universal-flat-entity diff/apply engine — **no second engine**.

---

## I. Uninstall & reconcile data safety (new — from review)

> **Review-hardened — data-loss landmine.** "Uninstall removes definitions; prune dangling placements"
> badly understates reality: `ApplicationSyncService.uninstallApplication` builds a diff to the empty set
> with `inferDeletionFromMissingEntities: true`, and object deletion runs
> `tableManager.dropTable({ cascade: true })` → raw `DROP TABLE IF EXISTS … CASCADE`; the app FK on
> `SyncableEntity` is `onDelete: CASCADE`. The **only** current guard is `application.canBeUninstalled`,
> which defaults to `true` for manifest/npm apps and has **no relationship to record counts**. There is no
> "prune placements but keep the surface/tables" path — objects and their **records** are dropped.

Required before any managed-mode reconcile ships:

1. **Uninstall guard.** Block uninstall (or require an explicit, audited `--force` + backup) when any
   object owned by the app holds records. Distinguish "definition with data" from "pure placement" in the
   uninstall migration.
2. **Reconcile never deletes data-bearing metadata implicitly.** `apply` reverting `managed-drift` must
   never drop a data-bearing column or hard-delete a data-bearing object/field; such a change requires an
   explicit, opt-in, audited migration — not silent deletion-inference.
3. **User-scope exclusion (defense in depth).** The deletion comparator gains an explicit
   `createdByUserWorkspaceId IS NULL` (and visibility) filter, so even a mis-scoped `from` set cannot
   infer-delete personal views/nav items. Today this protection is *only* indirect applicationId scoping
   (`find-flat-entities-by-application-id.util.ts`); make it explicit.

Data-model / behavior additions: `Application.canBeUninstalled` gains a record-aware check; the deletion
comparator (`universal-flat-entity-deleted-created-updated-matrix-dispatcher.util.ts`) gains the
user-scope exclusion. Covered by tests `08` C6/C7 and risk `09` §B.
