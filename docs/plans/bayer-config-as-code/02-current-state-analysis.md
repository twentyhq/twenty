# 02 — Current-State Analysis (What Twenty Has Today)

This document grounds the plan in the code that exists **now**, so the roadmap is "make the
emergent model explicit and complete," not "invent a new system." File anchors are given so
every claim is checkable.

## Executive summary

Twenty already has the substrate for config-as-code:

- A **uniform metadata ownership primitive** (`applicationId` + `universalIdentifier` on every
  syncable entity).
- An **override/activation primitive** (`OverridableEntity` = base + `isActive` + `overrides`)
  already applied to exactly the arrangement-heavy entities.
- A **central per-property registry** that already carries a (binary, ad-hoc) overridability flag.
- A **portable identity + universal-flat-entity** layer for cross-instance definitions.
- A **manifest + install/sync engine** that computes universal-flat-entity maps from an app
  manifest and diff/applies them — including **cross-app-owned entities**.
- A **declarative SDK (`define*`) + CLI** (`twenty app deploy/install/publish`, `twenty dev`).

What's missing is: a **principled facet taxonomy** (vs. the ad-hoc binary), **one** override
mechanism (today there are two), **enforcement** of cross-app/definition boundaries, a
**managed-mode + drift** capability, and a first-class **workspace-config artifact + environment/
overlay/promotion** tooling. Those are the deltas the roadmap builds.

## What exists (with anchors)

### Ownership & identity
- **`SyncableEntity`** — every metadata entity has `universalIdentifier` (uuid, unique per
  workspace) and `applicationId` (FK, non-null).
  `packages/twenty-server/src/engine/workspace-manager/types/syncable-entity.interface.ts`
- **Ownership-based standard/custom classification.** The `isCustom` boolean was **removed** in
  2.12.0; standard = owned by the twenty-standard-application, everything else = custom. Ownership
  is the `applicationId`, not a flag.
  `.../database/commands/upgrade-version-command/2-12/…-drop-is-custom-from-object-and-field-metadata.ts`
- **Applications are first-class.** `ApplicationEntity` (universalIdentifier, name, version,
  sourceType LOCAL/npm, availablePackages, defaultRole, canBeUninstalled …), plus
  `ApplicationRegistrationEntity` (catalog: manifest JSONB, isListed/isFeatured/isPreInstalled),
  and each workspace has a mandatory `workspaceCustomApplicationId`.
  `.../engine/core-modules/application/application.entity.ts`,
  `.../application/application-registration/application-registration.entity.ts`

### Activation + override primitive
- **`OverridableEntity extends SyncableEntity`** adds `overrides` (jsonb) + `isActive` (bool).
  `packages/twenty-server/src/engine/workspace-manager/types/overridable-entity.ts`
- Applied to the arrangement entities already: `view`, `view-field`, `view-field-group`,
  `command-menu-item`, `page-layout-tab`, `page-layout-widget`.
- **Surfaces already decomposed into surface + placements:** `page-layout` (SyncableEntity, the
  surface) + `page-layout-tab` + `page-layout-widget` (OverridableEntity, the placements). Views
  follow the same shape (`view` surface + `view-field`/`view-field-group`/`view-filter`/`view-sort`).

### The central property registry (the keystone)
- **`ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME`** declares, per property:
  `toCompare` (does the diff/sync compare it), `toStringify`, `universalProperty` (portable-id
  mapping), and **`isOverridable?: boolean`**. Derived types
  `MetadataEntityComparablePropertyName` and `MetadataEntityOverridablePropertyName` are computed
  from it.
  `.../engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant.ts`
- This is where a per-property ownership flag **already lives** — but as an unprincipled binary,
  applied inconsistently (documented smells in `01-ownership-model.md`).

### Two override mechanisms (an inconsistency to unify)
- **Object/field Presentation** uses a bespoke `standardOverrides` jsonb + dedicated resolvers,
  **not** `OverridableEntity`:
  `.../object-metadata/dtos/object-standard-overrides.dto.ts`
  (`labelSingular`, `labelPlural`, `description`, `icon`, `color`, `translations`),
  `.../field-metadata/dtos/field-standard-overrides.dto.ts`,
  `.../object-metadata/utils/resolve-object-metadata-standard-override.util.ts`,
  `.../field-metadata/utils/resolve-field-metadata-standard-override.util.ts`.
- **Everything else** uses `OverridableEntity.overrides`. Two systems, one concept.

### Portable identity + reconciliation engine
- **Universal-flat-entity** layer maps entity FKs/JSONB to `*UniversalIdentifier` /
  `universal*` forms so definitions are portable across workspaces/instances.
  `.../workspace-manager/workspace-migration/universal-flat-entity/…`
- **Flat-entity migration** computes diffs and applies them via action-handlers/validators/builders
  (`workspace-migration-runner`, `workspace-migration-builder`) — effectively a `plan`/`apply` for
  metadata.
- **Standard app sync** already treats standard objects "as code": `TwentyStandardApplicationService`
  computes flat entity maps for the standard app and diffs per workspace.
  `.../workspace-manager/twenty-standard-application/services/twenty-standard-application.service.ts`

### Manifest + install/sync (apps as code)
- **`Manifest`** (twenty-shared) already covers definitions **and** arrangement/presentation
  entities: `objects`, `fields`, `indexes`, `logicFunctions`, `frontComponents`, `permissionFlags`,
  `roles`, `skills`, `agents`, `connectionProviders`, `views`, `viewFields`, `navigationMenuItems`,
  `pageLayouts`, `pageLayoutTabs`, `commandMenuItems`, `translations`.
  `packages/twenty-shared/src/application/manifestType.ts`
- **Manifest → universal-flat-entity → diff/apply** is implemented:
  `.../application/application-manifest/services/compute-application-manifest-all-universal-flat-entity-maps.service.ts`,
  `.../application-manifest/application-sync.service.ts`,
  `.../application-manifest/application-manifest-migration.service.ts`,
  plus per-entity converters `from-*-manifest-to-universal-flat-*`.
- **Install / uninstall** service: `.../application/application-install/application-install.service.ts`.
- **Cross-app ownership already tested:**
  `test/integration/metadata/suites/application/successful-resync-application-with-cross-app-owned-view-field.integration-spec.ts`.

### Environment values & secrets
- **`ApplicationVariableEntity`** (`key`, `value`, `isSecret`, `description`) — per-app config/secrets.
  `.../application/application-variable/application-variable.entity.ts`
- **`ConnectionProviderEntity`** (oauthConfig) for integration credentials.
  `.../application/connection-provider/connection-provider.entity.ts`

### SDK authoring + CLI (DX already exists)
- **`define*`** authoring in `twenty-sdk`: `defineApplication`, `defineObject`, `defineField`,
  `defineView`, `defineViewField`, `defineCommandMenuItem`, `definePageLayout`,
  `definePageLayoutTab`, `defineNavigationMenuItem`, `defineRole`/`defineApplicationRole`,
  `defineLogicFunction`, `defineFrontComponent`, `defineConnectionProvider`, `defineIndex`,
  `defineSkill`, `defineAgent`, `definePermissionFlag`. Each config is
  `Omit<XManifest, …>`, keyed by `universalIdentifier`, referencing others by `*UniversalIdentifier`.
  `packages/twenty-sdk/src/sdk/define/**`
- **CLI**: `twenty app deploy | install | publish | uninstall`, `twenty dev | dev-once | build |
  generate-client | catalog-sync`, with an app-registration OAuth/API-client layer.
  `packages/twenty-sdk/src/cli/commands/**`, `.../cli/utilities/api/application-api.ts`

## The gaps (delta to the end-state)

| # | Gap | Why it matters for Bayer | Where addressed |
|---|-----|--------------------------|-----------------|
| G1 | Ownership is an **ad-hoc binary** (`isOverridable`), inconsistent, with Definition leaks | No principled, enforceable line; per-type debates recur | `03` §Facet registry; `07` PR1–2 |
| G2 | **Two override mechanisms** (`standardOverrides` vs `OverridableEntity.overrides`) | One concept, two code paths → drift & confusion; reconciliation must special-case | `03` §Unify overrides; `07` PR4 |
| G3 | **No enforcement** of cross-app / definition boundaries at the mutation boundary | An app (or the workspace) can silently mutate another owner's definition → breaks least-privilege & CSV | `03` §Enforcement; `07` PR3 |
| G4 | **No managed mode / drift** — the workspace layer is DB state edited via UI/GraphQL | Bayer cannot allow clickops; prod must not silently diverge from validated state | `03` §D; `07` **PR7** |
| G5 | **No first-class workspace-config artifact** (activation/arrangement/presentation across apps + install set + env values) as code | The workspace layer must be authorable, versioned, promoted — not just app manifests | `03` §E; `04`; `07` **PR5** |
| G6 | **No environment / overlay / promotion tooling** (`dev/staging/prod`, base⊕overlay, version pins, install matrix per instance) | The core of the GitOps experience | `04`; `05`; `07` **PR6 (compose), PR8 (env), PR12 (promote), PR13 (CI)** |
| G7 | **`deploy` has no `--dry-run/plan`** for PR-time diffs | GitOps requires a reviewable plan before apply | `05` §CI; `07` **PR7 (plan mode), PR10 (`config plan`)** |
| G8 | **Secrets** handling for as-code env values (encrypted at rest in Git, injected in CI) | Regulatory + security; no plaintext secrets in Git | `05` §Secrets; `07` **PR14** |
| G9 | **Audit/evidence export** (who/what/when/why/approved) as CSV/validation artifact | GxP / 21 CFR Part 11 | `08`; `07` **PR15** |

> PR numbers above are aligned to the authoritative roadmap in `07`. (Earlier drafts of this table used a
> different numbering; `07` wins.)

## The shape of the opportunity

Because the reconciliation engine, the portable identity, the manifest coverage of
arrangement/presentation entities, and the SDK authoring all exist, the majority of the work is:

1. **Name the facet** on every property (turn the binary into a principled taxonomy) — G1.
2. **Unify** the override mechanisms under that taxonomy — G2.
3. **Enforce** the boundaries the taxonomy defines — G3.
4. **Add managed mode + drift** so the workspace layer can be code-authoritative — G4.
5. **Introduce the workspace-config artifact + environment/overlay/promotion tooling** riding the
   same engine — G5–G8.
6. **Produce audit/validation evidence** from the pipeline — G9.

No new reconciliation engine, no fork of the app system. See `03-target-architecture.md`.
