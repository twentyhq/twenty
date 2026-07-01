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

Introduce a **caller-attribution context** and a guard that runs on every metadata mutation
(GraphQL resolvers + the flat-entity mutation path in `object-metadata.service.ts` and siblings).

```ts
// pseudo
assertMutationAllowed({
  caller: { kind: 'app' | 'workspace-config' | 'ui', applicationId?, mode },
  target: { applicationId, facetOf(property) },
  operation: 'create' | 'update' | 'delete',
}): void
```

Rules (derived entirely from facet + `applicationId`):

1. **Definition facet** may be written only when `caller.applicationId === target.applicationId`
   (an app editing its own definitions) — or by the standard-app sync for standard entities. No app,
   and not the workspace layer, may edit another owner's Definition.
2. **Additive creates** onto a foreign object are allowed, but the new component is attributed to
   the **caller's** `applicationId` (cross-app-owned — already supported; now made the *only* legal
   way to touch a foreign object).
3. **Activation / Arrangement / Presentation** may be written by the workspace layer
   (`workspace-config` caller) always; by `ui` only when the instance is **self-serve** (managed ⇒
   blocked, see §D); by an app only as a **seed** during its own install/upgrade.
4. **Delete** of a component requires ownership (`caller.applicationId === target.applicationId`) or,
   for placements, that the caller owns the surface or the workspace layer authored the placement.

Precursor: verify the mutation context carries caller identity today; if not, PR3a threads it
(see `07`).

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

### E.1 Concept: the workspace layer *is* an application, authored as code

Twenty already gives the workspace a home for its own metadata: `workspaceCustomApplication`. The
target models the managed workspace layer as **that application, expressed as code** — a per-instance
"config application" that:

- **depends on** the installed apps (`core`, `country-*`),
- **owns** the workspace-facet state: `activation` (isActive), `arrangement` (placements/order),
  `presentation` (labels/icons/colors/translations) — including **cross-app-owned** overrides on
  entities defined by other apps (already supported),
- carries the **install set** (which apps@version) and **env values** (`applicationVariable`s,
  `connectionProvider`s).

This reuses the entire existing pipeline: the workspace-config compiles to a **Manifest-like
universal-flat-entity map** and is diff/applied by the same engine as any app.

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
  `targetUniversalIdentifier` — they compile to `overrides` (or `standardOverrides`, per §B) on the
  target entity, attributed to the config application.
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
- **Collections (e.g. arrangement lists):** merge by `targetUniversalIdentifier`; overlay entries
  add or replace; an explicit `{ remove: true }` marker deletes a base entry.
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
