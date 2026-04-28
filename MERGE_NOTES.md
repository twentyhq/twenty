# MERGE_NOTES — SPOTVISION fork divergence log

This file tracks every file in the SPOTVISION private fork that diverges from `twentyhq/twenty` upstream. It exists so that future rebases can be planned instead of discovered mid-conflict.

**Rule**: whenever a commit on the SPOTVISION fork modifies a file that exists in upstream, add (or update) an entry below. If the divergence is net-new (a file we added), you do not need to track it here — git diff against upstream is enough for new files.

**Update discipline**: every PR merging to `main` of the SPOTVISION fork must leave this file coherent with the state of the repo. PR reviewers block merges that touch upstream files without updating this log.

## Entries

### Fase 0 — Scaffold

| #   | Path                                                                                                   | Reason for divergence                                                                                                                  | Rebase strategy                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1   | `packages/twenty-front/index.html`                                                                     | Rebrand: `<title>Twenty</title>` → `<title>SPOTVISION</title>`                                                                         | On conflict, keep SPOTVISION title. Non-semantic line — trivial resolution.                         |
| 2   | `packages/twenty-shared/src/types/FeatureFlagKey.ts`                                                   | Added `IS_ROADMAP_VIEW_ENABLED` for the new Roadmap viewType rollout gate.                                                             | On upstream conflicts, preserve our new enum member; resolve order alphabetically to minimize diff. |
| 3   | `packages/twenty-server/src/engine/workspace-manager/dev-seeder/core/utils/seed-feature-flags.util.ts` | Seed the Roadmap feature flag with `value: true` for dev workspaces.                                                                   | On conflict, keep our seed entry at the end of the values list.                                     |
| 4   | `packages/twenty-server/src/engine/twenty-orm/entity-manager/workspace-entity-manager.spec.ts`         | Added `IS_ROADMAP_VIEW_ENABLED: false` to the exhaustive `featureFlagsMap` fixture (Record<FeatureFlagKey, boolean> type requires it). | Mechanical: whenever upstream adds new flags, this fixture must be kept exhaustive.                 |

### Fase 1 — Schema: `ROADMAP` viewType, 8 columns, enums, DTOs

Fase 1 introduces the `ROADMAP` value in `ViewType`, a new `ViewRoadmapZoom` enum, 8 new columns on the `view` table (3 scalar + 5 FKs to `fieldMetadata`), a `CHK_VIEW_ROADMAP_INTEGRITY` constraint, and threads them through the flat-entity / universal-flat-entity plumbing so typecheck, migrations, and snapshot tests stay coherent. The behavior is dormant until Fase 2 wires the validators that reject invalid roadmap configurations.

#### Schema and GraphQL (`view` aggregate)

| #   | Path                                                                                         | Reason for divergence                                                                          | Rebase strategy                                                                                                                                           |
| --- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5   | `packages/twenty-shared/src/types/ViewType.ts`                                               | Added `ROADMAP = 'ROADMAP'` enum value.                                                        | Keep our entry between `CALENDAR` and `FIELDS_WIDGET`. If upstream reorders, preserve `ROADMAP`.                                                          |
| 6   | `packages/twenty-server/src/engine/metadata-modules/view/entities/view.entity.ts`            | 8 new columns + 5 `@ManyToOne` relations + `CHK_VIEW_ROADMAP_INTEGRITY` + 2 new indexes.       | On conflict, merge our column block (delimited by `roadmapDefaultZoom`/`roadmapFieldLabel`) verbatim after the calendar block. Keep the check constraint. |
| 7   | `packages/twenty-server/src/engine/metadata-modules/view/dtos/view.dto.ts`                   | Expose 8 roadmap fields + register `ViewRoadmapZoom` enum in GraphQL schema.                   | Keep the `ViewRoadmapZoom` `registerEnumType` line and field block. Regenerate GraphQL types after the rebase.                                            |
| 8   | `packages/twenty-server/src/engine/metadata-modules/view/dtos/inputs/create-view.input.ts`   | 8 optional roadmap fields on `CreateViewInput`.                                                | Preserve the whole `roadmap*` block. Order matches the DTO.                                                                                               |
| 9   | `packages/twenty-server/src/engine/metadata-modules/view/dtos/inputs/update-view.input.ts`   | 8 optional roadmap fields on `UpdateViewInput` (null accepted for FKs so they can be cleared). | Preserve the `roadmap*` block at the bottom of the class.                                                                                                 |
| 10  | `packages/twenty-server/src/engine/metadata-modules/field-metadata/field-metadata.entity.ts` | 5 new inverse `@OneToMany` relations on `FieldMetadataEntity` (one per roadmap FK).            | Keep the block between `calendarViews` and `mainGroupByFieldMetadataViews`. Naming follows the `<relationName>Views` convention of the rest of the file.  |

#### New files (not tracked here — listed for context)

- `packages/twenty-server/src/engine/metadata-modules/view/enums/view-roadmap-zoom.enum.ts`
- `packages/twenty-server/src/database/typeorm/core/migrations/common/1776370918527-addRoadmapTypeAndZoomEnumsToView.ts`
- `packages/twenty-server/src/database/typeorm/core/migrations/common/1776370918529-addRoadmapFieldsToView.ts`

#### Flat-entity / universal-flat-entity plumbing

| #   | Path                                                                                                                                                               | Reason for divergence                                                                                                                                           | Rebase strategy                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 11  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant.ts`                         | 8 new entries in the `view:` block for the roadmap scalar props and 5 FKs (with `universalProperty` names). Drives the flat-entity compare/stringify pipeline.  | Merge our entries between `calendarFieldMetadataId` and `visibility`. Do not drop.               |
| 12  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-foreign-key.constant.ts`                                         | 5 new foreign-key entries in the `view:` block (roadmapFieldStart/End/Group/Color/Label → roadmapField\*Id).                                                    | Keep after `mainGroupByFieldMetadata`. Order does not matter semantically; keep alphabetical.    |
| 13  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant.ts`                                           | 5 new ManyToOne relations on the `view:` block, with inverse property, universal foreign key, nullability.                                                      | Paired with entry 10 (inverse relations on FieldMetadataEntity) and entry 14 (OneToMany config). |
| 14  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant.ts`                                           | 5 new OneToMany entries on the `fieldMetadata:` block (roadmapStartViews/EndViews/GroupViews/ColorViews/LabelViews) with their aggregator names.                | Keep between `calendarViews` and `mainGroupByFieldMetadataViews`.                                |
| 15  | `packages/twenty-server/src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type.ts` | Extended the `view` assertion union with the 8 roadmap property names (scalars + universal-identifier forms of FKs) so the type-level checkpoint keeps passing. | Maintain parity with entry 11: every `toCompare: true` property on view must be listed.          |
| 16  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/types/__tests__/extract-entity-one-to-many-entity-relation-properties.type-test.ts`                | Type assertion expanded with the 5 new `fieldMetadata` OneToMany relations (all 5 also go into the syncable variant).                                           | Keep both lists in sync with the entity declarations.                                            |
| 17  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/types/__tests__/extract-entity-related-entity-properties.type-test.ts`                             | Same as above, for the combined ManyToOne+OneToMany property extractor.                                                                                         | Keep in sync.                                                                                    |

#### Converters (view and field metadata)

| #   | Path                                                                                                                                                                     | Reason for divergence                                                                                                                              | Rebase strategy                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 18  | `packages/twenty-server/src/engine/metadata-modules/flat-view/utils/from-view-entity-to-flat-view.util.ts`                                                               | Resolve and emit roadmap universal identifiers when converting `ViewEntity → FlatView`. Extracted helper `resolveRoadmapFieldUniversalIdentifier`. | Block added near the end; helper is local. Keep emission in the return object.                            |
| 19  | `packages/twenty-server/src/engine/metadata-modules/flat-view/utils/from-create-view-input-to-flat-view-to-create.util.ts`                                               | Pass roadmap FKs through `resolveEntityRelationUniversalIdentifiers` and populate the 8 roadmap props on `flatViewToCreate`.                       | Preserve the 5 extra entries on the destructuring/resolve call and the 8 extra assignments on the return. |
| 20  | `packages/twenty-server/src/engine/metadata-modules/flat-field-metadata/utils/from-field-metadata-entity-to-flat-field-metadata.util.ts`                                 | Map the 5 new `roadmap*Views` OneToMany relations to their `ids`/`UniversalIdentifiers` aggregators on `FlatFieldMetadata`.                        | Keep the 10 extra map calls (5 `*Ids` + 5 `*UniversalIdentifiers`).                                       |
| 21  | `packages/twenty-server/src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util.ts`                           | Default the 5 new aggregator props to `[]` on newly-created field metadata.                                                                        | Preserve defaults (empty arrays).                                                                         |
| 22  | `packages/twenty-server/src/engine/metadata-modules/object-metadata/object-metadata.service.ts`                                                                          | `computeFlatViewToCreate` (index view) defaults the 8 roadmap props (3 scalar defaults + 5 `null` universal identifiers).                          | Keep block adjacent to the `calendar*` defaults.                                                          |
| 23  | `packages/twenty-server/src/engine/metadata-modules/object-metadata/utils/compute-flat-record-page-fields-view-to-create.util.ts`                                        | Same as above for the FIELDS_WIDGET default view.                                                                                                  | Keep block adjacent to the `calendar*` defaults.                                                          |
| 24  | `packages/twenty-server/src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util.ts`                                  | Default the 5 new aggregator props on custom-object system fields.                                                                                 | Preserve defaults.                                                                                        |
| 25  | `packages/twenty-server/src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant.ts`                                           | Same as above for the statically-declared system field partials.                                                                                   | Preserve defaults.                                                                                        |
| 26  | `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util.ts`                                  | Standard-view factory emits the 8 roadmap props (defaults: `null` FKs and `null` zoom; `true` toggles).                                            | Keep near the `calendar*` / `mainGroupBy*` defaults in the returned object.                               |
| 27  | `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util.ts`                       | Default the 5 new aggregator props on the standard-field factory.                                                                                  | Preserve defaults.                                                                                        |
| 28  | `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util.ts`              | Same as above for the relation-field factory.                                                                                                      | Preserve defaults.                                                                                        |
| 29  | `packages/twenty-server/src/engine/core-modules/application/application-manifest/converters/from-view-manifest-to-universal-flat-view.util.ts`                           | Emit the 8 roadmap props when converting an application `ViewManifest` to a universal flat view.                                                   | Keep near the other null universal identifiers.                                                           |
| 30  | `packages/twenty-server/src/engine/core-modules/application/application-manifest/converters/from-field-manifest-to-universal-flat-field-metadata.util.ts`                | Default the 5 new `roadmap*ViewUniversalIdentifiers` to `[]`.                                                                                      | Preserve defaults.                                                                                        |
| 31  | `packages/twenty-server/src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock.ts`                                                       | Add the 5 new aggregator props (both `*Ids` and `*UniversalIdentifiers`) with `[]` defaults to the mock.                                           | Preserve defaults.                                                                                        |
| 32  | `packages/twenty-server/src/engine/metadata-modules/flat-field-metadata/__mocks__/get-morph-or-relation-target-flat-field-metadata-mock.ts`                              | Same as above.                                                                                                                                     | Preserve defaults.                                                                                        |
| 33  | `packages/twenty-server/src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view/services/create-view-action-handler.service.ts` | Pull the 5 resolved roadmap FK IDs from `resolveUniversalRelationIdentifiersToIds` and pass them onto the created flat entity.                     | Keep the extended destructuring and the extra assignments in the `flatEntity` payload.                    |
| 34  | `packages/twenty-server/src/utils/__test__/get-field-metadata-entity.mock.ts`                                                                                            | Add the 5 new roadmap `OneToMany` relation arrays to the typed entity mock so `Required<FieldMetadataEntity>` is satisfied.                        | Preserve defaults (empty arrays).                                                                         |

#### Test fixtures and mocks (batched `*ViewIds` and `*UniversalIdentifiers` additions)

The following files were edited in batch to satisfy `FlatFieldMetadata`/`UniversalFlatFieldMetadata` exhaustiveness after adding 5 new OneToMany relations. Each received the 5 missing `roadmap*ViewIds` and/or 5 missing `roadmap*ViewUniversalIdentifiers` array defaults.

| #   | Path                                                                                                                                                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 35  | `packages/twenty-server/src/engine/twenty-orm/repository/__tests__/workspace.repository.spec.ts`                                                                                                                                       |
| 36  | `packages/twenty-server/src/engine/twenty-orm/utils/__tests__/is-record-matching-rls-row-level-permission-predicate.util.spec.ts`                                                                                                      |
| 37  | `packages/twenty-server/src/engine/twenty-orm/utils/__tests__/get-field-metadata-id-to-column-names-map.util.spec.ts`                                                                                                                  |
| 38  | `packages/twenty-server/src/engine/twenty-orm/utils/__tests__/get-column-name-to-field-metadata-id.util.spec.ts`                                                                                                                       |
| 39  | `packages/twenty-server/src/engine/twenty-orm/utils/__tests__/format-twenty-orm-event-to-database-batch-event.util.spec.ts`                                                                                                            |
| 40  | `packages/twenty-server/src/engine/twenty-orm/utils/__tests__/compute-relation-connect-query-configs.util.spec.ts`                                                                                                                     |
| 41  | `packages/twenty-server/src/engine/api/utils/__tests__/compute-cursor-arg-filter.utils.spec.ts`                                                                                                                                        |
| 42  | `packages/twenty-server/src/engine/api/rest/core/rest-to-common-args-handlers/__tests__/selected-fields-handler.spec.ts`                                                                                                               |
| 43  | `packages/twenty-server/src/engine/api/graphql/graphql-query-runner/utils/__tests__/build-columns-to-select.spec.ts`                                                                                                                   |
| 44  | `packages/twenty-server/src/engine/api/graphql/graphql-query-runner/__mocks__/mockPersonObjectMetadata.ts`                                                                                                                             |
| 45  | `packages/twenty-server/src/engine/api/common/common-select-fields/utils/__tests__/get-all-selectable-fields.util.spec.ts`                                                                                                             |
| 46  | `packages/twenty-server/src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/__tests__/get-conflicting-fields.util.spec.ts`                                                                                |
| 47  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/utils/__tests__/add-flat-entity-to-flat-entity-and-related-entity-maps-through-mutation-or-throw.spec.ts`                                                              |
| 48  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/utils/__tests__/delete-flat-entity-from-flat-entity-and-related-entity-maps-through-mutation-or-throw.spec.ts`                                                         |
| 49  | `packages/twenty-server/src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/__tests__/add-universal-flat-entity-to-universal-flat-entity-and-related-entity-maps-through-mutation-or-throw.util.spec.ts`      |
| 50  | `packages/twenty-server/src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/__tests__/delete-universal-flat-entity-from-universal-flat-entity-and-related-entity-maps-through-mutation-or-throw.util.spec.ts` |
| 51  | `packages/twenty-server/src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/__tests__/reset-universal-flat-entity-foreign-key-aggregators.util.spec.ts`                                                       |

**Rebase strategy for 35–51**: all mechanical — every test fixture or spec that builds a `FlatFieldMetadata` must stay exhaustive. If upstream adds fields, merge both sets of new keys.

#### Snapshots (auto-regenerated by Jest)

The following Jest snapshot files were regenerated to reflect the new enum values and aggregator properties. Content is machine-generated and should not be edited by hand.

| #   | Path                                                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 52  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/constant/__tests__/__snapshots__/all-universal-flat-entity-properties-to-compare-and-stringify.constant.spec.ts.snap`                               |
| 53  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/utils/__tests__/__snapshots__/sort-metadata-names-children-first.util.spec.ts.snap`                                                                 |
| 54  | `packages/twenty-server/src/engine/metadata-modules/flat-field-metadata/__tests__/__snapshots__/morph-relation-from-create-field-input-to-flat-field-metadatas-to-create.spec.ts.snap`                              |
| 55  | `packages/twenty-server/src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/__tests__/__snapshots__/all-universal-flat-entity-foreign-key-aggregator-properties.constant.spec.ts.snap` |
| 56  | `packages/twenty-server/src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/__tests__/__snapshots__/universal-flat-entity-deleted-created-updated-matrix-dispatcher.util.spec.ts.snap`     |

**Rebase strategy for 52–56**: on conflict, resolve in favor of the regenerated content (`-u` flag). These files are produced by Jest from the real code; the source of truth is the code, not the snapshot.

#### Entity-manager spec (additional fixture work on top of Fase 0 entry 4)

Entry 4 already lists this file. Fase 1 added the 5 new OneToMany aggregator defaults to the `mockFlatFieldMetadata` fixture.

#### Frontend

| #   | Path                                                                                                                   | Reason for divergence                                                                                                                                              | Rebase strategy                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 57  | `packages/twenty-front/src/modules/object-record/object-options-dropdown/hooks/useSetViewTypeFromLayoutOptionsMenu.ts` | Added a `case ViewType.ROADMAP` branch (noop placeholder) so the exhaustive `switch` satisfies `assertUnreachable`. Real wiring lands in Fase 4.                   | Keep the case. Fase 4 replaces the body with the roadmap field picker invocation. |
| 58  | `packages/twenty-front/src/generated-metadata/graphql.ts`                                                              | Auto-generated by `nx run twenty-front:graphql:generate --configuration=metadata`. Reflects the new `ViewType.ROADMAP`, `ViewRoadmapZoom` enum, 8 new view fields. | Never hand-edit. On conflict, regenerate after the rebase and accept the output.  |

### Fase 2 — Validators, services, integration tests

Fase 2 wires the server-side rules that make a `ROADMAP` view safe to create: field-type validation for the 5 FKs (start/end must be DATE or DATE_TIME; group must be SELECT or RELATION; color must be SELECT; label is free), `IS_ROADMAP_VIEW_ENABLED` feature flag gate at the service boundary, editable-properties wiring for updates, and the AI `create_view` tool now accepts the ROADMAP surface. Two integration specs (field-type acceptance and field-deactivation cascade) mirror the Calendar reference suite.

#### Validator and editable properties

| #   | Path                                                                                                                                                     | Reason for divergence                                                                                                                                                                                                                             | Rebase strategy                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 59  | `packages/twenty-server/src/engine/metadata-modules/flat-view/constants/flat-view-editable-properties.constant.ts`                                       | Added 8 roadmap property names to `FLAT_VIEW_EDITABLE_PROPERTIES` so `UpdateViewInput` can mutate them.                                                                                                                                           | Merge our block between `calendarFieldMetadataId` and `visibility`.                                                    |
| 60  | `packages/twenty-server/src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-validator.service.ts` | New `collectRoadmapValidationErrors` helper + hooks in `validateFlatViewCreation` / `validateFlatViewUpdate` that enforce: start/end present, start ≠ end, start/end are DATE kind, group is SELECT/RELATION, color is SELECT, label FK resolves. | Keep helper at top of file. The two hook sites live just after the existing KANBAN blocks; mirror placement.           |
| 61  | `packages/twenty-server/src/engine/metadata-modules/flat-view/utils/from-update-view-input-to-flat-view-to-update-or-throw.util.ts`                      | Five new `if` blocks that re-resolve the 5 roadmap universal identifiers whenever their corresponding `*Id` is touched by the update.                                                                                                             | Preserve the block after the `mainGroupByFieldMetadataId` resolver. Pattern matches existing Calendar/Kanban handling. |

#### ViewService feature-flag gate

| #   | Path                                                                                             | Reason for divergence                                                                                                                                                                                | Rebase strategy                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 62  | `packages/twenty-server/src/engine/metadata-modules/view/services/view.service.ts`               | Inject `FeatureFlagService`; call `assertRoadmapFeatureFlagEnabledIfNeeded` from `createOne` and `updateOne` so `type: ROADMAP` is rejected when `IS_ROADMAP_VIEW_ENABLED` is off for the workspace. | Keep the guard helper near the constructor. On upstream edits to `createOne`/`updateOne`, ensure the guard runs before the migration-build service. |
| 63  | `packages/twenty-server/src/engine/metadata-modules/view/view.module.ts`                         | Import `FeatureFlagModule` so `FeatureFlagService` is resolvable for `ViewService`.                                                                                                                  | Keep the import in the `imports` array, adjacent to `ApplicationModule`.                                                                            |
| 64  | `packages/twenty-server/src/engine/metadata-modules/view-permissions/view-permissions.module.ts` | `ViewService` is also registered in this module (pre-existing design), so it too must import `FeatureFlagModule` to resolve the same dependency.                                                     | Mechanical mirror of entry 63.                                                                                                                      |

#### AI tool factory

| #   | Path                                                                                  | Reason for divergence                                                                                                                                                                                                                                 | Rebase strategy                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 65  | `packages/twenty-server/src/engine/metadata-modules/view/tools/view-tools.factory.ts` | Extended the Zod `CreateViewInputSchema` with roadmap fields, added three new private resolvers (`resolveRoadmapDateFieldMetadataId` / `GroupField…` / `ColorField…`), wired the `create_view` AI tool to accept and validate the ROADMAP parameters. | Keep the resolvers next to `resolveCalendarFieldMetadataId`. On upstream edits to the `create_view` handler, merge our ROADMAP branches carefully. |

#### New files (not tracked here — integration tests against the Roadmap schema)

- `packages/twenty-server/test/integration/graphql/suites/view/create-roadmap-view.integration-spec.ts` — 7 scenarios: full config, minimal config, and 5 rejection cases (missing start/end, start==end, non-date start, non-SELECT color).
- `packages/twenty-server/test/integration/metadata/suites/field-metadata/roadmap-field-deactivation-deletes-views.integration-spec.ts` — 3 cascade scenarios mirroring the calendar reference suite (start-field deactivation, end-field deactivation, unrelated-field deactivation leaves the view alive).

**Note**: these integration specs rely on the workspace-seeded test environment provided by CI (the reference `calendar-field-deactivation-deletes-views` spec fails in the same local env with the same "Standard target object metadata id undefined" error, confirming the limitation is environmental rather than code-related).

### Fase 3 — Frontend: static render

Fase 3 registers the `ROADMAP` viewType in the frontend and wires a minimum viable timeline: the TopBar (zoom switch + Today button + hidden-records counter), a two-tier TimeHeader (month band + day cell), records rendered as absolute-positioned bars on a zoomable timeline, a "Today" vertical line, and a weekends overlay. Drag/resize interactions are intentionally deferred to Fase 4. All rendering uses Linaria + `themeCssVariables` so dark mode works without extra code.

#### ViewType registry & index state

| #   | Path                                                                                                    | Reason for divergence                                                                                                                                           | Rebase strategy                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 66  | `packages/twenty-front/src/modules/views/types/ViewType.ts`                                             | Registered `{ icon: IconTimelineEvent, value: ViewType.ROADMAP }` in `VIEW_TYPE_ICON_MAPPING` so the ROADMAP option surfaces with the right icon.               | Keep the entry adjacent to the CALENDAR entry. If upstream renames `IconTimelineEvent`, pick the closest replacement. |
| 67  | `packages/twenty-front/src/modules/views/types/View.ts`                                                 | Added 8 `roadmap*` optional properties to the `View` shape so `useLoadRecordIndexStates` can read them and ViewPicker / OptionsDropdown (Fase 4) can edit them. | Preserve the block adjacent to the `calendarLayout` property.                                                         |
| 68  | `packages/twenty-front/src/modules/object-record/record-index/hooks/useLoadRecordIndexStates.ts`        | Load the 8 roadmap properties from the current view into the `recordIndexRoadmap*` atoms.                                                                       | Block lives next to the `recordIndexCalendarFieldMetadataIdState` assignment.                                         |
| 69  | `packages/twenty-front/src/modules/object-record/components/RecordComponentInstanceContextsWrapper.tsx` | Wrap children in `RecordRoadmapComponentInstanceContext.Provider` so roadmap component-scoped Jotai atoms resolve the correct `instanceId`.                     | Keep the provider nested inside the CALENDAR provider. Mirror the KANBAN/CALENDAR nesting pattern.                    |
| 70  | `packages/twenty-front/src/modules/object-record/record-index/components/RecordIndexContainer.tsx`      | Added the `ViewType.ROADMAP` branch that renders `RecordIndexRoadmapContainer` inside `StyledContainerWithPadding`.                                             | Block lives immediately after the `ViewType.CALENDAR` branch — same indentation, same wrapper.                        |

#### New files (net-new, not tracked in upstream rebases)

- `packages/twenty-front/src/modules/object-record/record-index/states/recordIndexRoadmapFieldStartIdState.ts`
- `packages/twenty-front/src/modules/object-record/record-index/states/recordIndexRoadmapFieldEndIdState.ts`
- `packages/twenty-front/src/modules/object-record/record-index/states/recordIndexRoadmapFieldGroupIdState.ts`
- `packages/twenty-front/src/modules/object-record/record-index/states/recordIndexRoadmapFieldColorIdState.ts`
- `packages/twenty-front/src/modules/object-record/record-index/states/recordIndexRoadmapFieldLabelIdState.ts`
- `packages/twenty-front/src/modules/object-record/record-index/states/recordIndexRoadmapDefaultZoomState.ts`
- `packages/twenty-front/src/modules/object-record/record-index/states/recordIndexRoadmapShowTodayState.ts`
- `packages/twenty-front/src/modules/object-record/record-index/states/recordIndexRoadmapShowWeekendsState.ts`
- `packages/twenty-front/src/modules/object-record/record-index/components/RecordIndexRoadmapContainer.tsx`
- `packages/twenty-front/src/modules/object-record/record-roadmap/constants/RoadmapZoomLevels.ts`
- `packages/twenty-front/src/modules/object-record/record-roadmap/constants/RoadmapDimensions.ts`
- `packages/twenty-front/src/modules/object-record/record-roadmap/contexts/RecordRoadmapContext.ts`
- `packages/twenty-front/src/modules/object-record/record-roadmap/states/contexts/RecordRoadmapComponentInstanceContext.ts`
- `packages/twenty-front/src/modules/object-record/record-roadmap/states/recordRoadmapZoomComponentState.ts`
- `packages/twenty-front/src/modules/object-record/record-roadmap/states/recordRoadmapViewportStartComponentState.ts`
- `packages/twenty-front/src/modules/object-record/record-roadmap/states/recordRoadmapRecordIdsComponentState.ts`
- `packages/twenty-front/src/modules/object-record/record-roadmap/states/recordRoadmapHiddenRecordCountComponentState.ts`
- `packages/twenty-front/src/modules/object-record/record-roadmap/utils/computeRoadmapBarPosition.ts`
- `packages/twenty-front/src/modules/object-record/record-roadmap/utils/computeRoadmapViewportDays.ts`
- `packages/twenty-front/src/modules/object-record/record-roadmap/hooks/useRecordRoadmapFetchRecords.ts`
- `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmap.tsx`
- `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapTopBar.tsx`
- `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapTimeHeader.tsx`
- `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapTimeline.tsx`
- `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapRow.tsx`
- `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapBar.tsx`
- `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapTodayLine.tsx`
- `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapWeekendsOverlay.tsx`
- `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordIndexRoadmapDataLoaderEffect.tsx`

### Fase 4 — Frontend: interactions

Fase 4a turns the static Fase 3 timeline into a draggable/resizable Gantt. Records respond to pointer drag (move the bar body to shift both dates, grab a 6px side handle to resize a single edge), optimistic updates hit the Apollo cache immediately and roll back on mutation failure with a snackbar, and `Ctrl/Cmd + wheel` steps through the zoom levels without interfering with regular scroll. Swimlanes (drag vertical between SELECT groups), keyboard navigation, and the double-click-to-create flow are scoped to Fase 4b alongside the options dropdown.

#### New files (not tracked here — listed for context)

- `packages/twenty-front/src/modules/object-record/record-roadmap/hooks/useRecordRoadmapUpdateDates.ts` — thin wrapper around `useUpdateOneRecord` that maps a `(recordId, startDate, endDate)` payload to the correct field names and surfaces a snackbar on failure.
- `packages/twenty-front/src/modules/object-record/record-roadmap/hooks/useRecordRoadmapBarInteraction.ts` — native-pointer-capture drag/resize state machine with transient `deltaDays` for the live preview and a single commit on pointerup.
- `packages/twenty-front/src/modules/object-record/record-roadmap/hooks/useRecordRoadmapWheelZoom.ts` — attaches a non-passive `wheel` listener that steps `recordRoadmapZoomComponentState` on Ctrl/Cmd + scroll.

#### Updated files (still local to `record-roadmap/`)

- `components/RecordRoadmapBar.tsx` — three pointer entry points (body drag, left/right resize handles); preview re-positions using the transient delta; calls `onCommit` only when the delta is non-zero.
- `components/RecordRoadmapRow.tsx` / `components/RecordRoadmapTimeline.tsx` — prop-drill `recordId` and a shared `handleBarCommit` that calls `updateDates`; Timeline now subscribes to `useRecordRoadmapWheelZoom`.

No upstream files touched in Fase 4a (all changes are scoped to the `record-roadmap/` module introduced in Fase 3).

### Fase 4b — Swimlanes, OptionsDropdown, double-click create

Fase 4b layers the interactive-reconfiguration surface on top of the Fase 4a timeline: records group into swimlanes backed by the SELECT field configured as `roadmapFieldGroupId` (RELATION renders as a single read-only swimlane), a vertical drag between swimlanes persists both the date change and the new group value in a single mutation, the ROADMAP options dropdown exposes start/end-date-field sub-pages so the view can be reconfigured after creation, and double-clicking an empty region creates a new record pre-filled with a 3-day span and the swimlane's group value before navigating to the new record. SSE subscription for record changes is now wired via `RecordRoadmapSSESubscribeEffect` so cross-tab edits reflect in real time.

#### New files (local to `record-roadmap/` and `object-options-dropdown/`)

- `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapSwimlane.tsx` — Sticky-header row container tagged with `data-roadmap-swimlane-key` so the bar-drag hook can detect cross-swimlane drops via `document.elementFromPoint`.
- `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapSSESubscribeEffect.tsx` — Mirrors the Kanban/Calendar SSE subscription pattern using `useListenToEventsForQuery` so live record updates land on the roadmap.
- `packages/twenty-front/src/modules/object-record/record-roadmap/hooks/useRecordRoadmapSwimlanes.ts` — Reads `recordIndexRoadmapFieldGroupIdState`, buckets `placedRecords` by SELECT option (sorted by `position`), appends an `__uncategorized__` bucket for null/unknown values, and returns `supportsCrossSwimlaneDrop` (true only when the group field is SELECT).
- `packages/twenty-front/src/modules/object-record/record-roadmap/hooks/useRecordRoadmapCreateOnDoubleClick.ts` — Calls `useCreateOneRecord` with a pre-computed `(startFieldName, endFieldName, groupFieldName)` payload, then opens the new record via `useOpenRecordFromIndexView`.
- `packages/twenty-front/src/modules/object-record/object-options-dropdown/components/ObjectOptionsDropdownRoadmapFieldPickerContent.tsx` — Generic sub-page accepting `role: 'start' | 'end'`; lists DATE-kind fields with search, disables the field already used by the other role, updates both the Jotai atom and the persisted view column on select.

#### Updated files

| #   | File                                                                                                                                                                                                          | Why                                                                                                                                                          | Merge guidance                                                                                                       |
|-----|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| 73  | `packages/twenty-front/src/modules/object-record/object-options-dropdown/types/ObjectOptionsContentId.ts`                                                                                                     | Added `'roadmapStartField'` and `'roadmapEndField'` to the dropdown sub-page union so ROADMAP views can open the start/end date field picker.                | Preserve both additions. Future upstream calendar-type additions extend the same union; mirror the pattern.          |
| 74  | `packages/twenty-front/src/modules/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent.tsx`                                                                                         | Routes the two new sub-page IDs to `ObjectOptionsDropdownRoadmapFieldPickerContent` with the appropriate `role` prop.                                        | Keep both case branches. No upstream equivalent exists yet.                                                          |
| 75  | `packages/twenty-front/src/modules/object-record/object-options-dropdown/components/ObjectOptionsDropdownLayoutContent.tsx`                                                                                   | Added a ROADMAP entry to the layout type switch (gated by `availableFieldsForRoadmap.length >= 2`) plus two sub-menu items (start/end date field) shown only when `currentView.type === ROADMAP`. Mirrors the CALENDAR block. | Preserve both additions. If upstream refactors `selectableItemIdArray`, make sure the ROADMAP ids stay in the list.   |
| 76  | `packages/twenty-front/src/modules/object-record/record-roadmap/hooks/useRecordRoadmapUpdateDates.ts`                                                                                                         | Extended the mutation payload with optional `groupFieldName` + `groupValue` so a cross-swimlane drop can update the group field in the same `updateOneRecord` call. | Local to our module. Keep.                                                                                            |
| 77  | `packages/twenty-front/src/modules/object-record/record-roadmap/hooks/useRecordRoadmapBarInteraction.ts`                                                                                                      | Added `currentSwimlaneKey` prop and `findSwimlaneKeyAtPoint` helper (via `document.elementFromPoint` + `closest('[data-roadmap-swimlane-key]')`) so the commit payload includes the drop target. | Local to our module. Keep.                                                                                            |
| 78  | `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapBar.tsx` / `RecordRoadmapRow.tsx` / `RecordRoadmapTimeline.tsx`                                                       | Prop-drill `currentSwimlaneKey`; Timeline wraps records in `RecordRoadmapSwimlane`, wires `handleDoubleClickEmptyArea` (computes day from `clientX` + `scrollLeft`), and forwards `targetSwimlaneKey` from the commit handler. | Local. Keep.                                                                                                          |
| 79  | `packages/twenty-front/src/modules/object-record/record-index/components/RecordIndexRoadmapContainer.tsx`                                                                                                     | Mounted `<RecordRoadmapSSESubscribeEffect />` alongside the data loader so SSE-driven record changes invalidate the cache.                                   | Local. Keep.                                                                                                          |

Also included in this phase: state-variable renames across the Fase 3/4a files to match the `matching-state-variable` oxlint rule, `oxlint-disable` comments on legitimate DOM-ref / constants-file cases, and replacing the hard-coded weekends overlay RGBA with `themeCssVariables.background.transparent.light`. These are cosmetic cleanups that surfaced once `twenty-oxlint-rules` was built locally — no upstream files touched.

### Fase 4b follow-up — UX refinements

Layered on top of the swimlane/options work after dog-fooding the view: a Jira-style left name column, sliding-window "infinite" horizontal scroll, pixel-accurate vertical alignment between the two panes, color-by-SELECT on the bars, click-to-open-record, and a prefetch fix that was silently dropping ROADMAP views from the view bar.

#### Notable module-local additions

- `components/RecordRoadmapNameColumn.tsx` — Sticky-top name column (260 px) with its own independent vertical scroller; `RecordRoadmapTimeline` syncs `scrollTop` onto it inside `handleCanvasScroll` so both panes always agree on which rows are in view.
- `constants/RoadmapDimensions.ts` — Added `ROADMAP_NAME_COLUMN_WIDTH = 260` and `ROADMAP_SWIMLANE_HEADER_HEIGHT = 28`; both panes now share those constants and carry `box-sizing: border-box` so the 1 px bottom border doesn't drift rows across long scrolls.
- `utils/computeRoadmapViewportDays.ts` — Rewritten to take explicit `renderedDaysStart` + `totalDays`; the Timeline now owns a sliding window (`INITIAL_BUFFER_DAYS = 365` each side, extended by `BUFFER_EXTENSION_DAYS = 180` whenever `scrollLeft` falls within 400 px of an edge). Scroll offset is preserved via `useLayoutEffect` when the left buffer grows.
- `components/RecordRoadmapBar.tsx` — Now applies `themeCssVariables.tag.background[color]` / `tag.text[color]` inline based on a `color` prop resolved from `roadmapFieldColorId`; same palette as Chips/Tags elsewhere, dark-mode-safe.
- `hooks/useRecordRoadmapBarInteraction.ts` — Added `onClick`. Triggered on `pointerup` only when `finalDelta === 0`, no cross-swimlane drop, and `mode === 'move'` — so drags and resize grabs never hijack the detail open.
- `hooks/useRecordRoadmapFetchRecords.ts` — Extends the GraphQL selection set with `roadmapFieldEndId`/`GroupId`/`ColorId`/`LabelId` (plus the sidebar's generic group field). Without this, `record[groupField.name]` was undefined and every record collapsed into Uncategorized.
- Auto-fit effect in Timeline: re-anchors viewport to (earliest placed record − 7 days) on first load and on every zoom change. "Go today" button sets it to (today − 7 days).
- `RecordRoadmapTopBar` — Removed the `DAY` zoom option from the selector and the wheel-zoom cycle; the enum value stays on backend for data compatibility.

#### Updated files (upstream touch-points — extend the Fase 4b table)

| #   | File                                                                                                                                                                                                         | Why                                                                                                                                                     | Merge guidance                                                                                                                           |
|-----|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| 80  | `packages/twenty-front/src/modules/metadata-store/hooks/useLoadStaleMetadataEntities.ts`                                                                                                                    | Added `ViewType.ROADMAP` to `INDEX_VIEW_TYPES` so the prefetch on login/refresh actually requests our view type — without this, existing ROADMAP views disappear from the view-bar after reload. | Preserve the addition. Future upstream view types should be added to the same constant.                                                   |
| 81  | `packages/twenty-front/src/modules/object-record/object-options-dropdown/types/ObjectOptionsContentId.ts` / `components/ObjectOptionsDropdownContent.tsx` / `components/ObjectOptionsDropdownLayoutContent.tsx` | Added `'roadmapColorField'` route + SELECT-field picker sub-page + Layout menu entry (with `IconColorSwatch` and the configured field's label as contextual text). | Preserve. Same pattern as start/end.                                                                                                      |
| 82  | `packages/twenty-front/src/modules/object-record/object-options-dropdown/components/ObjectOptionsDropdownRoadmapFieldPickerContent.tsx`                                                                      | Extended `role` to `'start' \| 'end' \| 'color'`. For `'color'` the filter switches from DATE-kind to SELECT and a "No color" reset row appears.            | Local to our module.                                                                                                                      |

No upstream files outside of those three chains were touched in the refinement pass.

### Fase 4b follow-up — Read-only mode

Honors `objectPermissions.canUpdateObjectRecords` from the roadmap context. When the caller lacks update permission, the Timeline flips a `readOnly` flag that:
- Drops drag/resize pointer handlers on `RecordRoadmapBar`, hides the resize handles, and switches `cursor` to `pointer`. The bar falls back to a plain `onClick` that still opens the record detail.
- Stops passing `onDoubleClickEmptyArea` to `RecordRoadmapSwimlane`, so dbl-click-to-create is silently disabled.
- Leaves the sticky name-column click-to-open intact — read-only users keep the detail panel UX.

All scoped to `record-roadmap/` — no upstream files touched.

## Upcoming phases (expected upstream touch-points — anticipated for planning, will be populated as work lands)

- Fase 4b follow-up: keyboard navigation.
- Fase 5: Playwright e2e coverage + performance measurement.

---

## Infra — SPOTVISION production CI/CD

Standalone stream, independent of the Roadmap phases. Adds the pipeline to
build, push, and deploy our private Twenty image to the AWS VM that serves
prod.

### New files (all net-new — no upstream conflicts expected)

- `.github/workflows/cd-deploy-spv.yaml` — tag-triggered `build-push` →
  `deploy` workflow. Pushes to `<account>.dkr.ecr.<region>.amazonaws.com/
  spotvision/twenty:<semver>` and rolls the compose on the VM via SSH.
  `workflow_dispatch` is available for rollbacks.
- `packages/twenty-docker/docker-compose.prod.spv.yaml` — prod compose
  without a `db` service (RDS replaces it). Logs ship to CloudWatch group
  `/spotvision/twenty`. Includes optional `db` service under the
  `with-db` Docker Compose profile for non-RDS bootstraps.
- `packages/twenty-docker/.env.prod.spv.example` — template for the `.env`
  that lives on the VM. Never commit the populated version.
- `docs/infra/README.md` — topology + one-time AWS setup (ECR, IAM roles,
  RDS, S3) + GitHub secrets inventory.
- `docs/infra/vm-setup.md` — Ubuntu/EC2 bootstrap checklist, systemd unit,
  first-deploy smoke.
- `docs/infra/release.md` — how to cut a release (tag), rollback, hotfix.

### Upstream workflows left intact

- `.github/workflows/cd-deploy-main.yaml` and
  `.github/workflows/cd-deploy-tag.yaml` are upstream's deploy dispatches
  to the private `twenty-infra` repo. We don't have `TWENTY_INFRA_TOKEN`,
  so these fail silently on every tag/main push — the `peter-evans/
  repository-dispatch` step errors out but doesn't block anything else.
  Keeping them untouched so future rebases against `twentyhq/twenty`
  stay conflict-free; if they start interfering, delete the files (they're
  net-remove only, no conflict risk).

### Dockerfile — no change needed

The `twenty-aws` target at
`packages/twenty-docker/twenty/Dockerfile:133-137` already extends the
`twenty` production image with `aws-cli` — it's exactly what the workflow
builds. Leaving the file upstream-identical keeps rebases trivial.

### Schema fix-up from prod bootstrap

- `packages/twenty-server/src/database/typeorm/core/migrations/common/1776370918600-restoreFieldsWidgetInViewTypeEnum.ts`
  — our Fase 1 migration accidentally dropped `FIELDS_WIDGET` from
  `view_type_enum` (template was authored before upstream added that
  value). This follow-up migration re-adds it idempotently so upstream's
  v1.23 instance command `ADD VALUE 'TABLE_WIDGET' AFTER 'FIELDS_WIDGET'`
  does not fail on our fork.

### Fase 6 — OpportunityMilestone + Roadmap deviation indicators

Fase 6 introduces the Timeline/Gantt of Opportunities by Milestones. It
adds the standard object `OpportunityMilestone` (Fase 6.1, MVP scope —
no `assignee` / `attachments` / `timelineActivities` yet, tracked in
local memory `project_milestones_mvp_pending_relations`), 4 new
optional view columns (`roadmapFieldPlannedEndId`,
`roadmapFieldStatusId`, `roadmapFieldBlockedById`, `roadmapShowDeviation`)
to drive the planned-vs-actual ghost bar, the overdue red border, the
lock badge for client/internal/external blockers, and the cumulative
deviation chip on swimlane headers.

#### Fase 6.1 — Standard object OpportunityMilestone

| #   | Path                                                                                                                                                                  | Reason for divergence                                                                                                                                                              | Rebase strategy                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 52  | `packages/twenty-shared/src/metadata/constants/standard-object.constant.ts`                                                                                           | New `opportunityMilestone` entry (universalIdentifier + 17 fields + 3 indexes + 1 view). Adds inverse `milestones` field on the existing `opportunity` entry.                      | Keep block alphabetically between `opportunity` and `person`. Preserve UUIDs.    |
| 53  | `packages/twenty-server/src/modules/opportunity/standard-objects/opportunity.workspace-entity.ts`                                                                     | Adds `milestones: EntityRelation<OpportunityMilestoneWorkspaceEntity[]>` and the corresponding type import. **First fork divergence over `opportunity*` upstream.**                | On conflict, keep our `milestones` field after `noteTargets`.                    |
| 54  | `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/compute-opportunity-standard-flat-field-metadata.util.ts`       | Adds the `milestones` ONE_TO_MANY relation block.                                                                                                                                  | Keep block right after `noteTargets`.                                            |
| 55  | `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/build-standard-flat-field-metadata-maps.util.ts`                | Registers `opportunityMilestone: buildOpportunityMilestoneStandardFlatFieldMetadatas` in the exhaustive map.                                                                       | Mechanical — keep entry alphabetically.                                          |
| 56  | `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/object-metadata/create-standard-flat-object-metadata.util.ts`                  | Registers the `opportunityMilestone` factory (icon `IconFlag`, label "Milestone") in the exhaustive map.                                                                           | Mechanical — keep entry alphabetically.                                          |

**New files (not tracked here — listed for context):**

- `packages/twenty-server/src/modules/opportunity/standard-objects/opportunity-milestone.workspace-entity.ts`
- `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/compute-opportunity-milestone-standard-flat-field-metadata.util.ts`

#### Fase 6.2 — 4 optional columns on `view`

| #   | Path                                                                                                                                                       | Reason for divergence                                                                                                                                                                              | Rebase strategy                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 57  | `packages/twenty-server/src/engine/metadata-modules/view/entities/view.entity.ts`                                                                          | 3 new nullable FK columns + 3 `@ManyToOne` relations (`onDelete: 'SET NULL'`) + 1 boolean (`roadmapShowDeviation`, default false). Integrity check unchanged.                                       | On conflict, keep our block after `roadmapFieldLabel*`.                                          |
| 58  | `packages/twenty-server/src/engine/metadata-modules/field-metadata/field-metadata.entity.ts`                                                               | 3 new inverse `@OneToMany` (`roadmapPlannedEndViews`, `roadmapStatusViews`, `roadmapBlockedByViews`).                                                                                               | Mechanical — keep block after `roadmapLabelViews`.                                               |
| 59  | `packages/twenty-server/src/engine/metadata-modules/view/dtos/view.dto.ts`                                                                                 | 3 FK fields + 1 bool exposed on the GraphQL DTO.                                                                                                                                                   | Preserve the block after `roadmapFieldLabelId`.                                                  |
| 60  | `packages/twenty-server/src/engine/metadata-modules/view/dtos/inputs/create-view.input.ts`                                                                 | 3 optional `IsUUID` FK fields + 1 optional bool, all `IsOptional`.                                                                                                                                 | Preserve block at the bottom of the class.                                                       |
| 61  | `packages/twenty-server/src/engine/metadata-modules/view/dtos/inputs/update-view.input.ts`                                                                 | 3 optional `IsUUID` FK fields (nullable for clearing) + 1 optional bool.                                                                                                                           | Preserve block at the bottom of the class.                                                       |
| 62  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant.ts`                 | 3 new property entries with universal aggregator names + 1 scalar `roadmapShowDeviation`.                                                                                                          | Keep entries between `roadmapFieldLabelId` and `visibility`.                                     |
| 63  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-foreign-key.constant.ts`                                 | 3 new entries (`roadmapFieldPlannedEnd`, `roadmapFieldStatus`, `roadmapFieldBlockedBy`).                                                                                                            | Mechanical — keep alphabetic order.                                                              |
| 64  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant.ts`                                   | 3 new ManyToOne relations with their inverse one-to-many properties.                                                                                                                               | Paired with entry 58.                                                                            |
| 65  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant.ts`                                   | 3 new OneToMany aggregators on `fieldMetadata`.                                                                                                                                                    | Mechanical — keep block after `roadmapLabelViews`.                                               |
| 66  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/types/__tests__/extract-entity-one-to-many-entity-relation-properties.type-test.ts`        | Type assertion expanded with 3 new aggregator names.                                                                                                                                               | Keep both lists in sync with the entity declarations.                                            |
| 67  | `packages/twenty-server/src/engine/metadata-modules/flat-entity/types/__tests__/extract-entity-related-entity-properties.type-test.ts`                     | Same as above for the combined extractor.                                                                                                                                                          | Keep in sync.                                                                                    |
| 68  | `packages/twenty-server/src/engine/metadata-modules/flat-view/utils/from-view-entity-to-flat-view.util.ts`                                                 | 3 new `resolveRoadmapFieldUniversalIdentifier(...)` calls + 3 new entries in the return object.                                                                                                    | Mechanical — append after `roadmapFieldLabel`.                                                   |
| 69  | `packages/twenty-server/src/engine/metadata-modules/flat-view/utils/from-create-view-input-to-flat-view-to-create.util.ts`                                 | Resolves 3 new universal identifiers and emits them on `flatViewToCreate`. Also defaults `roadmapShowDeviation` from input.                                                                        | Preserve the destructuring + assignments.                                                        |
| 70  | `packages/twenty-server/src/engine/metadata-modules/flat-view/utils/from-update-view-input-to-flat-view-to-update-or-throw.util.ts`                        | 3 new `if (updatedEditableFieldProperties.roadmap*Id !== undefined)` blocks that resolve and store the universal identifier.                                                                       | Append after the existing `roadmapFieldLabel` block.                                             |
| 71  | `packages/twenty-server/src/engine/metadata-modules/flat-view/constants/flat-view-editable-properties.constant.ts`                                         | 4 new properties added to the editable-properties tuple (`roadmapFieldPlannedEndId`, `Status`, `BlockedBy`, plus `roadmapShowDeviation`).                                                          | Keep block in declared order.                                                                    |
| 72  | `packages/twenty-server/src/engine/metadata-modules/flat-field-metadata/utils/from-field-metadata-entity-to-flat-field-metadata.util.ts`                   | 3 new pairs of aggregator emissions (`*ViewIds` and `*ViewUniversalIdentifiers`).                                                                                                                  | Mechanical — keep both pairs sequential after `roadmapLabelView*`.                               |
| 73  | `packages/twenty-server/src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type.ts` | 3 new universal-identifier names + 1 scalar `roadmapShowDeviation` added to the `view` assertion union.                                                                                            | Keep block in declared order.                                                                    |
| 74  | `packages/twenty-server/src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view/services/create-view-action-handler.service.ts` | Pulls 3 new resolved IDs from `resolveUniversalRelationIdentifiersToIds` and forwards them to the created flat entity.                                                                              | Keep extra destructuring + extra `flatEntity` assignments.                                       |
| 75  | `packages/twenty-server/src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-validator.service.ts`   | New validation: `roadmapFieldPlannedEnd` must be DATE/DATE_TIME (FK resolves), `roadmapFieldStatus` and `roadmapFieldBlockedBy` must be SELECT. Update-detection includes the 3 new identifiers.   | Append after `roadmapFieldLabel` validation.                                                     |
| 76  | `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util.ts`                    | Defaults the 3 new FK ids + 3 new universal identifiers + `roadmapShowDeviation` on the standard-view factory.                                                                                     | Keep adjacent to the existing `roadmap*` defaults.                                               |
| 77  | `packages/twenty-server/src/engine/metadata-modules/object-metadata/object-metadata.service.ts`                                                            | Defaults the 3 new universal identifiers + `roadmapShowDeviation` on the object-metadata service's index-view factory.                                                                             | Keep adjacent to the existing `roadmapFieldColor*Universal*` defaults.                           |
| 78  | `packages/twenty-server/src/engine/metadata-modules/object-metadata/utils/compute-flat-record-page-fields-view-to-create.util.ts`                          | Same as above for the FIELDS_WIDGET default view.                                                                                                                                                  | Keep adjacent to the existing defaults.                                                          |
| 79  | `packages/twenty-server/src/engine/core-modules/application/application-manifest/converters/from-view-manifest-to-universal-flat-view.util.ts`             | Defaults the 3 new universal identifiers + `roadmapShowDeviation` when converting a `ViewManifest` to a universal flat view.                                                                       | Keep block near the other null defaults.                                                         |
| 80  | `packages/twenty-server/src/engine/metadata-modules/minimal-metadata/dtos/minimal-view.dto.ts`                                                              | 3 FK fields + 1 bool exposed on the minimal-view DTO so cached views hydrate the four atoms on first paint.                                                                                        | Preserve block after `roadmapFieldLabelId`.                                                      |
| 81  | `packages/twenty-server/src/engine/metadata-modules/minimal-metadata/minimal-metadata.service.ts`                                                          | 3 new `roadmapField*Id` + `roadmapShowDeviation` in the projection.                                                                                                                                | Preserve trailing block.                                                                         |
| 82  | `packages/twenty-server/src/utils/__test__/get-field-metadata-entity.mock.ts`                                                                              | 3 new `roadmap*Views: []` defaults so `Required<FieldMetadataEntity>` stays exhaustive.                                                                                                            | Mechanical.                                                                                      |

**Test fixtures touched in batch (item-level entries omitted; 6 new aggregator defaults inserted via `perl -pi`):** ~20 spec/mocks under
`packages/twenty-server/src/engine/twenty-orm/`, `flat-entity/utils/__tests__/`, `flat-field-metadata/__mocks__/`, `api/`, etc. Each gained 3 `roadmap*ViewIds: []` and/or 3 `roadmap*ViewUniversalIdentifiers: []` to satisfy the exhaustiveness checks.

**New files (not tracked here):**

- `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-opportunity-milestone-views.util.ts` (Fase 6.6)
- `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-opportunity-milestone-view-fields.util.ts` (Fase 6.6)

#### Fase 6.3 — Frontend GraphQL fragments + atoms

| #   | Path                                                                                                                                                  | Reason for divergence                                                                                                                                       | Rebase strategy                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 83  | `packages/twenty-front/src/modules/views/graphql/fragments/viewFragment.ts`                                                                           | 3 FK fields + 1 bool added to `ViewFragment`.                                                                                                                | Append after `roadmapFieldLabelId`.                                            |
| 84  | `packages/twenty-front/src/modules/views/types/View.ts`                                                                                               | 3 optional FK fields + 1 optional bool on `View` type.                                                                                                       | Preserve block.                                                                |
| 85  | `packages/twenty-front/src/modules/views/types/GraphQLView.ts`                                                                                        | Same as above on `GraphQLView`.                                                                                                                              | Preserve block.                                                                |
| 86  | `packages/twenty-front/src/modules/metadata-store/graphql/queries/findMinimalMetadata.ts`                                                             | 3 FK fields + 1 bool added to the minimal views projection.                                                                                                  | Append after `roadmapFieldLabelId`.                                            |
| 87  | `packages/twenty-front/src/modules/object-record/record-index/hooks/useLoadRecordIndexStates.ts`                                                      | Hydrates 4 new atoms (planned end / status / blocked by / show deviation) from the loaded view.                                                              | Append after the `roadmapFieldLabel` hydration.                                |
| 88  | `packages/twenty-front/src/modules/object-record/record-roadmap/hooks/useRecordRoadmapFetchRecords.ts`                                                | Reads the 3 new FK atoms and adds them to `roadmapFieldIds` so the GQL selection set covers them.                                                            | Preserve the imports + `roadmapFieldIds` extension.                            |

**New files (not tracked here):**

- `packages/twenty-front/src/modules/object-record/record-index/states/recordIndexRoadmapFieldPlannedEndIdState.ts`
- `packages/twenty-front/src/modules/object-record/record-index/states/recordIndexRoadmapFieldStatusIdState.ts`
- `packages/twenty-front/src/modules/object-record/record-index/states/recordIndexRoadmapFieldBlockedByIdState.ts`
- `packages/twenty-front/src/modules/object-record/record-index/states/recordIndexRoadmapShowDeviationState.ts`

#### Fase 6.4 — RecordRoadmapBar visual indicators

| #   | Path                                                                                                                  | Reason for divergence                                                                                                                                                            | Rebase strategy                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 89  | `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapBar.tsx`                      | Accepts `plannedEndDate` / `status` / `blockedBy`. Renders dashed ghost bar (`<StyledGhostBar>`), red overdue border, lock icon overlay + tinted color when blocked by a party. | Whole-component rewrite; merge by reapplying the new props + ghost bar block. |
| 90  | `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapRow.tsx`                      | Forwards `plannedEndDate` / `status` / `blockedBy` to the bar.                                                                                                                   | Mechanical.                                                                    |
| 91  | `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapTimeline.tsx`                 | Resolves the 3 new FK field metadata items, builds `placedRecords` with `plannedEndDate`/`status`/`blockedBy`, passes them to each row.                                          | Preserve the field-metadata `useMemo` blocks + the `placedRecords` extension.  |
| 92  | `packages/twenty-front/src/modules/object-record/record-roadmap/hooks/useRecordRoadmapSwimlanes.ts`                   | Extends `RoadmapPlacedRecord` with the 3 new optional fields.                                                                                                                    | Preserve the type extension.                                                   |

**New files:**

- `packages/twenty-front/src/modules/object-record/record-roadmap/constants/roadmapBlockedByColorMap.ts`
- `packages/twenty-front/src/modules/object-record/record-roadmap/hooks/useRecordRoadmapDeviation.ts`

#### Fase 6.5 — Cumulative deviation badge in swimlane header

| #   | Path                                                                                                       | Reason for divergence                                                                                                                                                                  | Rebase strategy                                                          |
| --- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 93  | `packages/twenty-front/src/modules/object-record/record-roadmap/components/RecordRoadmapNameColumn.tsx`    | Reads `recordIndexRoadmapShowDeviationState`. When true, sums per-record `deviationDays` and renders a danger-tinted pill badge in the swimlane header.                                  | Preserve the `Temporal.Now` snapshot, `computeRoadmapDeviation` import, the StyledDeviationBadge, and the conditional render. |

#### Fase 6.6 — OpportunityMilestone standard views (TABLE-only)

The default standard view for OpportunityMilestone is a TABLE view named
`allOpportunityMilestones`. The Roadmap view is intentionally *not*
auto-generated yet because `createStandardViewFlatMetadata` does not (yet)
resolve the new roadmap field IDs from field names — extending it is
tracked as a follow-up. Until then, users create the Roadmap view from
the view picker (the feature flag `IS_ROADMAP_VIEW_ENABLED` is seeded
true on dev workspaces).

| #   | Path                                                                                                                                | Reason for divergence                                                                                                          | Rebase strategy                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| 94  | `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/view/build-standard-flat-view-metadata-maps.util.ts` | Registers `opportunityMilestone: computeStandardOpportunityMilestoneViews`.                                                    | Mechanical — keep entry alphabetically.          |
| 95  | `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/view-field/build-standard-flat-view-field-metadata-maps.util.ts` | Registers `opportunityMilestone: computeStandardOpportunityMilestoneViewFields`.                                               | Mechanical — keep entry alphabetically.          |

**New files:**

- `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-opportunity-milestone-views.util.ts`
- `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-opportunity-milestone-view-fields.util.ts`

#### Fase 6 — Pendings before final sign-off

- **Migration**: `npx nx run twenty-server:database:migrate:generate --name add-opportunity-milestone-and-roadmap-extensions --type fast`. Requires dev env up. Both Fase 6.1 (new entity + table) and Fase 6.2 (4 view columns) coexist in a single instance command.
- **MVP relations to add**: `assignee` (workspaceMember), `attachments` (polymorphic), `timelineActivities` (polymorphic) on OpportunityMilestone — recorded in local memory `project_milestones_mvp_pending_relations`.
- **Auto-generated Roadmap view**: extend `createStandardViewFlatMetadata` to resolve the 3 new roadmap field names → IDs, then add a second view in `compute-standard-opportunity-milestone-views.util.ts`.
- **E2E coverage**: smoke test for the full flow (create Opportunity → create Milestones → see overdue / lock / deviation chip) is pending Fase 6.7.
