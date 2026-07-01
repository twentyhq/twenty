# 10 — Glossary

Precise definitions of every term used in this plan. When a term maps to a concrete code artifact,
the anchor is given.

### Activation (facet)
A workspace-owned facet answering "is this on/visible/enabled here?" Backed by the `isActive` column on
`OverridableEntity`. The app ships a default; the workspace owns the live value.

### Additive (contribution)
A change that *adds* a new, attributed component rather than editing an existing one. The only legal way
for an app to touch another app's object. Contrast with in-place mutation (forbidden across owners).

### App (application)
A first-class package of **definitions** (+ seed defaults) with a stable `universalIdentifier`, a
version, and a manifest. `ApplicationEntity` / `ApplicationRegistrationEntity`. Owns what it defines.

### Arrangement (facet)
A workspace-owned facet answering "where does it sit / how is it grouped/ordered?" (position, tab,
section, grid position, field order). Backed by the override layer. App seeds a default.

### Apply
Reconcile a target instance to the repo state: compute the effective universal-flat-entity maps, diff
against live, and execute the changes. Idempotent. Contrast with **Plan**.

### Base ⊕ Overlay
The composition of shared workspace config (`workspace/base`) with per-instance deltas
(`workspace/overlays/<instance>`) to produce one effective `WorkspaceConfigManifest` per instance.
Merge semantics in `03` §F.

### CODEOWNERS
GitHub mechanism mapping repo paths to required reviewers. Encodes ownership boundaries and
separation-of-duties (author ≠ approver ≠ promoter).

### Cross-app-owned entity
A component defined by one app but placed on / related to another app's entity. E.g. a `country-de`
widget on a `core`-owned page. The definition is owned by the contributor; the placement is
workspace-owned arrangement. Already exercised by Twenty integration tests.

### CSV (Computer System Validation)
The regulated-industry process of proving a system does what it's specified to do, reproducibly. This
plan supports it via determinism + evidence export (`08` D3/E).

### Definition (facet)
The app-owned facet: the intrinsic identity/behavior of a thing (an object's `name`/`type`, a field's
`type`, a command's `engineComponentKey`). Changing it makes it a different thing or breaks app code.
Upgrade overwrites it; uninstall removes it. Not workspace-writable.

### Drift
A divergence between a managed instance's live state and the repo-declared state, for a managed,
comparable property. Classified as `managed-drift` (repo authoritative → reverted on apply),
`definition-change` (app upgrade), or `unmanaged` (ignored). Detected by `plan`.

### Effective (metadata / entity / config)
The result of composing all layers (standard app → apps → base → overlay) and applying overrides +
activation on top of definitions. What a user actually experiences on the instance.

### Facet
The classification of a **property** into `definition | activation | arrangement | presentation`,
which mechanically determines ownership, overridability, and reconciliation authority. Declared in the
property registry; `isOverridable` is derived from it. The core of the ownership model (`01`).

### Facet registry
`ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME` — the central per-property config
(`toCompare`, `toStringify`, `universalProperty`, and, in the target state, `facet`).
`flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant.ts`.

### Flat entity / Universal flat entity
Twenty's computed, portable representations of metadata used by the migration engine. The **universal**
variant replaces per-instance IDs with `universalIdentifier`s so definitions are portable across
instances. The substrate that makes config-as-code work.

### GitOps
Operating model where Git is the source of truth for system state; changes are PRs; CI computes a
**plan** and executes an **apply**; drift is detected and reconciled.

### Install matrix
The set of `app@version` installed on a given instance, declared in that instance's `instance.ts`.
Determines what runs where (e.g. `country-de` only on `prod-eu`).

### Managed mode
An instance mode where the workspace-owned layer is authored as code and the repo is authoritative;
UI edits of managed facets are locked and divergence is drift. Contrast **self-serve**.

### Manifest
The built artifact describing an app (`Manifest` in twenty-shared): definitions + seed
arrangement/presentation. Produced by the SDK from `define*` sources; consumed by the install/sync
engine. `twenty-shared/src/application/manifestType.ts`.

### OverridableEntity
Base class = `SyncableEntity` + `overrides` (jsonb) + `isActive` (bool). The latent tri-layer
(definition columns / activation / override) the plan makes explicit.
`workspace-manager/types/overridable-entity.ts`.

### Overlay
Per-instance delta layer under `workspace/overlays/<instance>` that customizes the shared `base`.

### Overrides layer
The workspace-owned shadow of arrangement/presentation properties, resolved on top of app definitions,
reversible. Today split across `OverridableEntity.overrides` and object/field `standardOverrides`
(unified in the target state).

### Plan
A dry-run reconciliation: compute the diff between repo and live instance and report it **without
applying**. The PR-time artifact and the nightly drift check. `twenty config plan` / `deploy --dry-run`.

### Presentation (facet)
A workspace-owned facet answering "what is it called / how does it look?" (label, icon, color,
translations). Where **Company → Organization** lives. Backed by the override layer / `standardOverrides`.

### Promotion
Advancing pinned versions/overlays along `promotionOrder` (`dev → staging → prod`), gated by review and
protected environments. `twenty config promote`.

### secretRef
An authoring-time placeholder referencing a secret by key without embedding its value; resolved in CI
from the encrypted store. Keeps shapes validatable without exposing secrets.

### Seed
An app's *proposed default* for a workspace-owned facet, copied into the workspace layer once at
install and offered on new installs — never re-imposed on upgrade.

### Self-serve mode
The default instance mode: the workspace layer is edited via the UI (seed as a starting point); UI
wins; app upgrades don't clobber workspace edits. Contrast **managed mode**.

### Separation of duties
Distinct roles for authoring, approving, and promoting a change. Enforced via CODEOWNERS + protected
environments. A GxP requirement.

### Surface (commons)
A shared container others place things onto: page layout, record page, command menu, navigation. Owned
by the workspace (a commons); everything placed on it is arrangement. "Surfaces are commons" resolves
per-element ownership debates with one decision.

### SyncableEntity
Base class giving every metadata entity `universalIdentifier` + `applicationId` (owner FK).
`workspace-manager/types/syncable-entity.interface.ts`.

### Tiebreaker
A property whose facet isn't obvious (a genuine binding-vs-identity call). Resolved by the "does
changing it break the app's contract?" test and annotated with `facetRationale` in the registry.

### universalIdentifier
The stable, portable identity of a metadata entity, identical across dev/staging/prod. The linchpin of
cross-instance config-as-code. Never a per-instance DB UUID.

### WorkspaceConfigManifest
The new shared type capturing the workspace-owned layer (install set, activation, arrangement,
presentation, values) for an instance; compiled from `twenty-sdk/config` `define*` files and reconciled
by `WorkspaceConfigSyncService`. `03` §E.2.

### workspaceCustomApplication
The existing per-workspace application that owns workspace-authored custom entities. In the target
state, the managed workspace layer is modeled as this application authored **as code**.
