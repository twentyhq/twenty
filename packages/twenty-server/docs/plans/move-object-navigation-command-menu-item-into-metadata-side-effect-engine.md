# Move the object navigation command menu item into the metadata side-effect engine (name-free deterministic UID)

## Context

Part of the `isSystemSideEffect` engine ownership effort (#2550), sibling of #2669 (INDEX view, shipped in twentyhq/twenty#23081 with follow-ups #23506 and #23585), #2721 (record-page stack, in flight in twentyhq/twenty#23651) and #2741 (OBJECT navigation menu item).

Every object carries a singleton **navigation command menu item** (`engineComponentKey: NAVIGATION`, the "Go to Companies" command). It is provisioned imperatively across four paths in `ObjectMetadataService`, next to the create-object input transpiler. It is not an entity the engine knows about: `commandMenuItem` is absent from `ALL_METADATA_SIDE_EFFECT_COMPANION_METADATA_NAMES`, so no handler can read or emit it today.

It differs from its siblings in two ways that make this the smallest migration of the series, and one that makes it the only one carrying a live bug:

- it already sets `isSystemSideEffect: true` and already has an **explicit** delete path, so there is no schema change and no cascade-behind-the-engine problem to fix;
- its `conditionalAvailabilityExpression` embeds the object's mutable `nameSingular` and is **never recomputed on rename**.

## Current state (verified)

| Path | `object-metadata.service.ts` | Behaviour |
|---|---|---|
| create | `:524` -> `buildFlatNavigationCommandMenuItem` `:755` | `commandMenuItemId: v4()`, `position = max(position) + 1` over **all** command menu items |
| update (`isActive` toggle) | `:140` -> `computeCommandMenuItemChangesForActiveToggle` `:817` | enable: create-if-missing `:856` or reactivate; disable: deactivate |
| update (rename / shortcut) | none | nothing recomputed |
| delete | `:409`, `:440` | already emits `commandMenuItem.flatEntityToDelete` explicitly |

- **Identity is the last one not derived through `computeDeterministicUuid`.** `build-navigation-flat-command-menu-item.util.ts:71` computes `v5(objectUniversalIdentifier, NAVIGATION_COMMAND_UUID_NAMESPACE)`, with a hardcoded magic UUID standing in for the application. The convention everywhere else is `computeDeterministicUuid` = `v5(\`${entityNamespace}:${value}\`, applicationUniversalIdentifier)`. `NAVIGATION_COMMAND_UUID_NAMESPACE` is referenced by 7 files, all under `twenty-server` (the builder, its spec, `object-metadata.service.ts`, and the 1-21 / 2-10 / 2-17 upgrade commands). No reference in `twenty-apps`, `twenty-front`, `twenty-shared` or the SDK.
- **The deterministic helper already exists and is dead code.** `getNavigationCommandUniversalIdentifier({ applicationUniversalIdentifier, objectUniversalIdentifier })` lives in `packages/twenty-shared/src/application/deterministic-identifier/get-command-menu-item-universal-identifier.util.ts`, is exported from `application/index.ts:52`, and has zero call sites.
- **`isSystemSideEffect: true` is already hardcoded** by the builder, on every path that has ever created one of these rows (`createOneObject`, twenty-standard seeding, the 1-21 and 2-10 commands). No column to add, no flag backfill.
- **Rename leaves a stale permission expression.** `buildNavigationConditionalAvailabilityExpression` (`:29`) emits `targetObjectReadPermissions.${nameSingular}`, `nameSingular` is updatable (`update-object.input.ts:34`), and the helper has no call site on the object update path. `hotKeys` is derived from `objectMetadata.shortcut` the same way and is equally stale.
- **Label, short label and icon are rename-safe.** They are interpolated templates (`'Go to ${navigateToObjectMetadataItem.labelPlural}'`), not denormalized values, so no label backfill is ever needed.
- **twenty-standard uses the same builder**, not literal constants: `build-standard-flat-command-menu-item-maps.util.ts:72`. There is no standard-versus-custom identifier divergence to converge, unlike #2669 / #2721 / #2741.
- **Apps cannot author one.** `from-command-menu-item-manifest-to-universal-flat-command-menu-item.util.ts:43` hardcodes `engineComponentKey: FRONT_COMPONENT_RENDERER`. Zero app blast radius.
- **The GraphQL API can.** `CreateCommandMenuItemInput.engineComponentKey` accepts any `EngineComponentKey` value, and `engineComponentKey` is itself in the overridable property set. This is the same shape `CreateViewInput.key` had before twentyhq/twenty#23651 generalized the `ViewKey` reservation.
- **Application ownership is inconsistent.** The row is stamped with `resolvedOwnerFlatApplication` on object create and on the enable branch, but the enable branch runs its migration under `twentyStandardFlatApplication.universalIdentifier` (`:213`), and twenty-standard seeding stamps twenty-standard.
- **User customization has a path.** `label`, `shortLabel`, `icon`, `position`, `isPinned`, `hotKeys`, `availabilityType`, `availabilityObjectMetadataId`, `engineComponentKey` and `pageLayoutId` are `isOverridable: true`, so the existing `universalOverrides` plumbing covers this entity.

## Goal

- Neither the API object-create path nor the object-update path builds a navigation command menu item.
- The metadata side-effect engine owns the create / update / delete lifecycle of the object's navigation command menu item.
- Its universal identifier is derived through the shared `computeDeterministicUuid` convention like every other engine-owned entity.
- An object rename keeps the identifier and refreshes the derived conditional availability expression, which it does not do today.
- Existing workspaces are re-owned onto the derived identifier, including twenty-standard rows.

## Core design

- **Always emit, throw on squatting.** No "skip when the caller already provides the derived identifier" and no caller-stack noop: both patterns were abandoned during the #2669 implementation and do not exist in any shipped handler. The engine emits unconditionally; a caller entity colliding with an engine identifier that is not itself `isSystemSideEffect` is recorded by `recordUniversalIdentifierCollisionIfNeeded` and fails the migration with `RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER`. This mirrors `objectSystemFieldsAndIndexViewOnCreate` and `objectRecordPageOnCreate`.
- **Converge the identifier onto `getNavigationCommandUniversalIdentifier` and delete `NAVIGATION_COMMAND_UUID_NAMESPACE`.** The current scheme is deterministic and name-free already, but it predates `computeDeterministicUuid` and is the last metadata identity in the codebase that bypasses it. Deriving on the object's application matches the convention settled in twentyhq/twenty#23506 for engine-owned children of an object. Leaving the helper exported-but-dead is not an option: twentyhq/twenty#23651 deleted `getFieldsWidgetViewUniversalIdentifier` for exactly that reason, so the choice is converge or commit to the bespoke `v5` permanently.
- **Settle the helper's value shape before the first mint.** The three siblings in that file follow a documented rule ("one util per availabilityType, prefixed by the type"): `GLOBAL:${engineComponentKey}`, `GLOBAL_OBJECT_CONTEXT:${engineComponentKey}`, `RECORD_SELECTION:${engineComponentKey}:${objectUniversalIdentifier}`. The navigation helper instead emits `${objectUniversalIdentifier}:navigation`, with no type prefix and a string literal instead of the `EngineComponentKey`. The navigation command is `availabilityType: GLOBAL` with `engineComponentKey: NAVIGATION`, so the consistent shape is `GLOBAL:${EngineComponentKey.NAVIGATION}:${objectUniversalIdentifier}`; the object is part of the identity because every object's navigation command shares the same engine component key, which is why `getGlobalCommandMenuItemUniversalIdentifier` cannot be reused. Changing this is free today (zero call sites) and permanent after the reconcile command runs.
- **Reserve `EngineComponentKey.NAVIGATION` in the flat command menu item validator.** The analogue of the generalized `ViewKey` guard shipped in twentyhq/twenty#23651: a row carrying that key must be `isSystemSideEffect: true`, and an object cannot have two non-deleted ones. Unlike the record page, there is no frontend precedence resolver to fall back on: two navigation commands for one object are two rows in the command menu, so the singleton has to be enforced rather than tolerated. The guard must run against the effective value after overrides, since `engineComponentKey` is overridable.
- **Ownership is the object's application, uniformly.** This fixes the enable-branch mismatch and is also the derivation input, so the two concerns are settled by one rule.
- **Positions are derived deterministically from the caller input list**, not from `max(position) + 1` over a map snapshot. Under the engine, batch object creation is the norm (manifest sync expands side effects through `validateBuildAndRunWorkspaceMigrationFromRecord`), and N handler invocations over the same snapshot would all compute the same position. `computeDefaultIndexViewFieldPositionByFieldUniversalIdentifier` and `computeDefaultRecordPageViewFieldPositionByFieldUniversalIdentifier` are the pattern to follow.
- **twenty-standard gate.** Same as #2669 / #2721 / #2741: standard synchronizes through the from/to migration path, which never runs the side-effect engine. `build-standard-flat-command-menu-item-maps.util.ts` keeps building its own rows, through the same builder, now on the derived identifier.

## Changes

### 1. Shared builder (derive the identifier)

- Replace the `v5(objectUniversalIdentifier, NAVIGATION_COMMAND_UUID_NAMESPACE)` derivation in `build-navigation-flat-command-menu-item.util.ts` with `getNavigationCommandUniversalIdentifier`, taking the object's `applicationUniversalIdentifier`.
- Align the helper's value shape (see Core design) and delete `NAVIGATION_COMMAND_UUID_NAMESPACE`.

### 2. Engine handlers

- `create:objectMetadata`: `objectNavigationCommandMenuItemOnCreate`, a sibling of `objectSystemFieldsAndIndexViewOnCreate` and `objectRecordPageOnCreate`, emitting the navigation command with a deterministic position.
- `update:objectMetadata`: recompute `conditionalAvailabilityExpression` when `nameSingular` changes and `hotKeys` when `shortcut` changes. This is the analogue of `objectIndexViewLabelIdentifierOnUpdate` / `objectRecordPageLabelIdentifierOnUpdate`, and it fixes the stale-expression bug independently of the ownership move.
- `update:objectMetadata`: absorb `computeCommandMenuItemChangesForActiveToggle`, keeping its create-if-missing branch for workspaces whose row predates the engine.
- `delete:objectMetadata`: new `commandMenuItem` bucket on `objectSystemSideEffectsOnDelete`, widening its `FlatEntityToDelete` union (currently `fieldMetadata | index | searchFieldMetadata | view | viewField`, plus whatever twentyhq/twenty#23651 adds). This is a relocation, not a behaviour change, since object delete already emits these explicitly.
- Companions: add `commandMenuItem` to `ALL_METADATA_SIDE_EFFECT_COMPANION_METADATA_NAMES.objectMetadata` on the create and delete paths.

### 3. Validator

- Reserve `EngineComponentKey.NAVIGATION` in the flat command menu item validator: `isSystemSideEffect` required, one non-deleted row per object, checked against the post-override value.

### 4. Remove caller provisioning

- Delete `buildFlatNavigationCommandMenuItem`, `findNavigationCommandMenuItemForObject` and `computeCommandMenuItemChangesForActiveToggle` from `object-metadata.service.ts`, along with the second `validateBuildAndRunWorkspaceMigration` call on the update path (`:200-220`), the `commandMenuItem` blocks on the create / update / delete matrices, and the now-unused `flatCommandMenuItemMaps` cache reads.

### 5. Backfill command (next free workspace command version)

Single-track, unlike the 2-26 and 2-28 splits: apps cannot author these rows, so there is no manifest population to demote.

- Re-own every navigation command menu item onto the derived identifier, resolving each object's application; twenty-standard rows re-own on `TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER`.
- Leave `position`, `isPinned` and every overridden property untouched: only `universalIdentifier` changes.
- Transaction-guarded, dry-run, idempotent, no-op `down`, skip soft-deleted rows, invalidate the flat command menu item maps.
- 2-28 is taken by twentyhq/twenty#23651; pin the version once that PR lands.

### 6. Audit committed commands

Three commands resolve navigation commands by the old namespace and must be adapted in the same PR, using the `remap-record-page-universal-identifiers-to-pre-2-28.util.ts` pattern from twentyhq/twenty#23651 so workspaces upgrading from an older version still resolve pre-migration identifiers:

- `1-21-workspace-command-1775500013000-refactor-navigation-commands.command.ts`
- `2-10/utils/build-navigation-command-menu-item-operations-or-throw.util.ts`
- `2-17/utils/build-call-recording-navigation-command-menu-item-availability-expression-sync-operations.util.ts`

Handlers resolve strictly by the derived identifier and skip until the reconcile command runs, so command ordering matters.

### 7. Tests

- Unit: create handler (emission, deterministic position under batch object creation, app-owned object gets an app-owned command), update handlers (`nameSingular` change recomputes the expression, `shortcut` change recomputes `hotKeys`, label templates untouched, `isActive` toggle in both directions, create-if-missing on enable), delete bucket, updated builder and helper.
- Validator: API input carrying `engineComponentKey: NAVIGATION` is rejected; a second navigation command on the same object is rejected; an override that moves a row onto the reserved key is rejected.
- Integration: object created through the API gets an engine-provisioned command with zero caller provisioning; rename keeps the identifier and refreshes the expression; toggle deactivates and reactivates; delete removes it through the engine.
- Standard: sync after the re-own converges with zero diff.
- Command spec for the reconcile command.

## Not in scope

- **No schema change.** `isSystemSideEffect` already exists on `CommandMenuItemEntity` and is already `true` on every row this plan touches.
- **No app ecosystem workstream and no breaking-change section.** Manifests cannot author navigation commands, and no navigation command identifier is exported through `twenty-shared` or the SDK. This is the one issue in the series where the identifier change is invisible outside the server.
- **Other `engineComponentKey` values** (`FRONT_COMPONENT_RENDERER`, record-selection and global commands) keep their current ownership.

## Risks / notes

- **Identifiers change for every navigation command menu item in every workspace.** Contained to `twenty-server`, but it makes command ordering against the three adapted commands load-bearing.
- **`engineComponentKey` is overridable**, so the reservation guard has to evaluate the effective value rather than the base row, otherwise an override is a hole in the singleton invariant.
- **Pinning interacts with #2598** ("Remove ability to command menu items to be pinned on existing objects"): `isPinned` is overridable and user-visible, and the re-own must not touch it. Sequencing the two is worth a decision.
- **The rename bug is independently shippable.** If this migration slips, the `update:objectMetadata` recompute is worth landing on its own, since today every renamed object has a navigation command gated on a permission key that no longer exists.
- **Deriving on the object's application means the identifier is only stable while that application is.** `applicationId` is not part of `UpdateObjectInput`, so objects cannot be transferred through the API today; if that ever changes, every engine-owned child identifier moves with it, not just this one.
