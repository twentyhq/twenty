# Omnia CRM Customizations

This document tracks all modifications made on top of upstream [twentyhq/twenty](https://github.com/twentyhq/twenty). **Check this file after every upstream merge** to verify nothing was overwritten.

Use `OMNIA-CUSTOM` markers in code to tag custom sections. After merging upstream, run:

```bash
./scripts/check-customizations.sh
```

---

## Critical Files (Repeatedly Wiped by Upstream Merges)

These files have been overwritten by upstream merges multiple times. **Always verify after merge.**

| File                                                                                                                                                                                      | What We Changed                                                                                                                                | Why                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/twenty-front/src/modules/object-record/hooks/useBuildRecordInputFromRLSPredicates.ts`                                                                                           | Write-scoped dynamic relation resolution for `policy.agent -> agentProfile.workspaceMember`                                                    | `Policy / Write only / Agent is Me` breaks create/edit without resolving the intermediate agent-profile id                                                     |
| `packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/hooks/useFilteredSelectOptionsFromRLSPredicates.ts`                                                           | Select-option RLS filtering only uses `ALL + WRITE` predicates                                                                                 | Read-only rules must not leak into editable pickers/selects after the scoped RLS rollout                                                                       |
| `packages/twenty-front/src/modules/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectForm.tsx`                      | Removed Organization plan gate on RLS                                                                                                          | Self-hosted, no billing — RLS must always be available                                                                                                         |
| `packages/twenty-front/src/modules/navigation/components/MainNavigationDrawer.tsx`                                                                                                        | Sidebar: Settings at top, Documentation removed, Search item retained in sidebar                                                               | UX preferences                                                                                                                                                 |
| `packages/twenty-front/src/modules/ui/navigation/navigation-drawer/components/NavigationDrawerHeader.tsx`                                                                                 | Removed inline search icon next to workspace name                                                                                              | Search should only live in the sidebar                                                                                                                         |
| `packages/twenty-front/src/modules/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownDefaultComponents.tsx`                               | Removed nested three-dots dropdown; inlined Log out directly; removed Create Workspace and Invite user                                         | Simplify workspace dropdown — single-workspace deployment doesn't need workspace creation or inline invite                                                     |
| `packages/twenty-front/src/modules/navigation/hooks/useDefaultHomePagePath.ts`                                                                                                            | Default landing page uses workspace sidebar nav items as source of truth; admin last-visited validated against sidebar; members land on first sidebar item | Prevents landing on objects active in metadata but absent from sidebar (e.g. Companies)                                                                        |
| `packages/twenty-front/src/modules/navigation-menu-item/components/WorkspaceNavigationMenuItemsDispatcher.tsx`                                                                            | Members bypass the editable workspace tree and use a fixed Omnia workspace section (Leads, Calls, Policies, Notes, Tasks)                      | Prevents admin-only folders like Carriers from leaking back into member sidebars after upstream nav changes                                                    |
| `packages/twenty-front/src/modules/command-menu/components/CommandMenuButton.tsx`                                                                                                         | Pinned create CTA supports explicit button variant/accent so Policies/Leads pages keep a filled blue "Create ..." button                       | Upstream hardcodes secondary buttons here and will revert to blue outline / generic CTA                                                                        |
| `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant.ts`                                                        | Pin Delete single/multiple record actions as header buttons                                                                                     | Upstream `isPinned: false` hides Delete in the dropdown; we want it visible like the legacy path                                                               |
| `packages/twenty-front/src/modules/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker.tsx`                                                                | Restores shared `additionalFilter` support for multi-select relation pickers                                                                   | Lead → Policy picker relies on this to hide policies already linked to other leads across typing/load-more                                                     |
| `packages/twenty-front/src/modules/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelSection.tsx` | Record-level permissions are split into Read + write / Read only / Write only sections                                                         | Omnia policy access depends on action-scoped RLS, not one shared predicate tree                                                                                |
| `packages/twenty-front/src/locales/*.po` and `src/locales/generated/*.ts`                                                                                                                 | Custom Lingui translations                                                                                                                     | Must re-run `lingui extract && lingui compile` after upstream merge                                                                                            |
| `packages/twenty-server/src/app.module.ts`                                                                                                                                                | Excludes `/assets/*` and `/images/*` from SPA fallback and sets HTML vs asset cache headers                                                    | Prevents Cloudflare from caching `index.html` at stale JS/CSS URLs during rolling deploys                                                                      |
| `packages/twenty-server/src/engine/metadata-modules/role/role.entity.ts`                                                                                                                  | Added `editWindowMinutes` column                                                                                                               | Configurable edit window per role                                                                                                                              |
| `packages/twenty-server/src/engine/metadata-modules/object-permission/object-permission.entity.ts`                                                                                        | Added `editWindowMinutes` column                                                                                                               | Per-object edit window override                                                                                                                                |
| `packages/twenty-server/src/engine/metadata-modules/role/services/workspace-roles-permissions-cache.service.ts`                                                                           | Resolves `editWindowMinutes` in cache                                                                                                          | Edit window enforcement depends on this                                                                                                                        |
| `packages/twenty-shared/src/types/ObjectPermissions.ts`                                                                                                                                   | Added `editWindowMinutes` to shared type                                                                                                       | Both server + frontend depend on this                                                                                                                          |
| `packages/twenty-server/src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util.ts`                                                                                     | RLS predicates are action-scoped (`ALL` / `READ` / `WRITE`) and relation-based `Me` predicates resolve through linked records                  | Policies must stay globally visible while only write-restricted for non-owners; `policy.agent = Me` must resolve via AgentProfile, not raw `workspaceMemberId` |
| `packages/twenty-server/src/engine/twenty-orm/entity-manager/workspace-entity-manager.ts`                                                                                                 | Seeds a request-scoped RLS computation cache into the ORM workspace context                                                                    | GraphQL requests become painfully slow if the same role/object filter is rebuilt repeatedly per resolver                                                       |
| `packages/twenty-server/src/engine/api/graphql/metadata.module-factory.ts`                                                                                                                | Metadata response cache must include `FindAllRecordPageLayouts`, `FindFieldsWidgetCoreViews`, and `FindManyLogicFunctions`                     | App boot loads these metadata queries on every login; without cache they hit the backend every time                                                            |
| `packages/twenty-server/src/engine/core-modules/observability/utils/slow-path-observer.util.ts`                                                                                           | Shared slow-path observer utility provides thresholded timing warnings for cache misses, cache resolution, and schema builds                   | We need cheap, consistent timing logs across services without re-implementing `performance.now()` plumbing in every hotspot                                    |
| `packages/twenty-server/src/engine/api/graphql/graphql-config/hooks/use-cached-metadata.ts`                                                                                               | Core-view metadata cache keys must stay user-scoped and slow metadata cache misses must log with workspace/operation context                   | Core view visibility is user-dependent; when metadata gets slow again we need proof of which cache-miss operations regressed                                   |
| `packages/twenty-server/src/engine/workspace-cache/services/workspace-cache.service.ts`                                                                                                   | Slow Redis hash checks, Redis fetches, provider recomputes, and full workspace-cache resolutions now warn with affected keys                   | Metadata/page-layout slowness in prod often comes from cache misses or Redis latency, not from the resolver itself                                             |
| `packages/twenty-server/src/engine/api/graphql/graphql-config/graphql-config.service.ts`                                                                                                  | Slow core `/graphql` schema resolution now logs module-resolution vs workspace-schema timing                                                   | If core GraphQL slows down again we need to know whether request-scoped DI/context setup or schema construction is the expensive step                          |
| `packages/twenty-server/src/engine/api/graphql/workspace-schema.factory.ts`                                                                                                               | Slow workspace schema builds now log per-stage timings (flat maps, schema artifact cache, generation, resolver creation, makeExecutableSchema) | Core GraphQL latency is hard to debug without knowing whether the bottleneck is cache fetch, schema artifact miss, or executable schema assembly               |

## Custom Server Modules (Entirely New)

These directories are 100% Omnia code. Upstream won't touch them, but verify they're still registered in their parent modules.

### `packages/twenty-server/src/modules/agent-profile/`

- `agent-profile.module.ts` — Module registration
- `services/agent-profile-resolver.service.ts` — Resolves AgentProfile ID from WorkspaceMember ID for RLS and pre-query hooks

### `packages/twenty-server/src/modules/policy/`

- `query-hooks/policy-create-one.pre-query.hook.ts` — Auto-assigns agentId + derives name before insert (required for RLS)
- `query-hooks/policy-create-many.pre-query.hook.ts` — Same for bulk create
- `query-hooks/policy-create-one.post-query.hook.ts` — Sets submittedDate, LTV after insert
- `query-hooks/policy-create-many.post-query.hook.ts` — Same for bulk
- `query-hooks/policy-update-one.pre-query.hook.ts` — Re-derives name on carrier/product change + **configurable edit window enforcement** (reads `editWindowMinutes` from `rolesPermissions` cache per role/object, null = no restriction; admins always bypass)
- `query-hooks/policy-update-many.pre-query.hook.ts` — Same for bulk update + same edit window enforcement
- `utils/format-duration.util.ts` — Human-readable duration formatting for edit window error messages
- `query-hooks/policy-update-one.post-query.hook.ts` — Recalculates LTV on update
- `query-hooks/policy-update-many.post-query.hook.ts` — Same for bulk
- `query-hooks/policy-query-hook.module.ts` — Module registration (imports `WorkspaceCacheModule` for role checks)
- `utils/build-policy-display-name.util.ts` — "Carrier - Product" name derivation
- `utils/enrich-policy-after-save.util.ts` — Post-save enrichment (LTV, dates)
- `utils/get-today-for-member.util.ts` — `getNowUtc()` helper (returns UTC ISO string for submittedDate)
- `utils/lookup-carrier-product-commission.util.ts` — LTV lookup from CarrierProduct

### `packages/twenty-server/src/modules/call/`

- `query-hooks/call-create-one.pre-query.hook.ts` — Auto-assigns agentId on call create
- `query-hooks/call-create-many.pre-query.hook.ts` — Same for bulk
- `query-hooks/call-create-one.post-query.hook.ts` — Post-create enrichment
- `query-hooks/call-create-many.post-query.hook.ts` — Same for bulk
- `query-hooks/call-query-hook.module.ts` — Module registration

### `packages/twenty-apps/internal/compliance-qa/`

- `src/application-config.ts` — App registration (Compliance QA)
- `src/objects/qa-scorecard.ts` — QA Scorecard object definition with 25+ fields (scores, red flags, rich text details)
- `src/constants/compliance-rules.ts` — All compliance rules, scripts, scoring criteria, red flag definitions, AI prompts
- `src/logic-functions/analyze-call-compliance.ts` — Two-pass AI analysis (red flags + full scorecard) via HTTP endpoint
- `src/logic-functions/backfill-compliance-qa.ts` — Batch backfill for existing call recordings
- `src/utils/transcribe-recording.ts` — Deepgram Nova-3 batch transcription with speaker diarization
- `src/utils/call-ai.ts` — Wrapper for Twenty's AI text generation endpoint
- `src/roles/default-role.ts` — App role with read/write/AI permissions
- `src/views/qa-scorecard-view.ts` — Default list view for QA Scorecards
- `src/navigation-menu-items/qa-scorecard-navigation-menu-item.ts` — Sidebar navigation entry

### `packages/twenty-server/src/engine/metadata-modules/ingestion-pipeline/`

Full ingestion pipeline engine — configurable pull/push data pipelines with field mappings, preprocessors, scheduling, and logging.

- `ingestion-pipeline.module.ts` — Module registration
- `entities/ingestion-pipeline.entity.ts` — Pipeline entity (mode, schedule, source config, auth, pagination, dedup)
- `entities/ingestion-field-mapping.entity.ts` — Per-field mapping entity (source path → target field, transforms)
- `entities/ingestion-log.entity.ts` — Ingestion run log (status, counts, errors, incoming payload)
- `services/ingestion-pipeline.service.ts` — CRUD + test execution for pipelines
- `services/ingestion-pull-scheduler.service.ts` — Cron-based pull scheduling on server startup
- `services/ingestion-record-processor.service.ts` — Processes ingested rows: maps fields, resolves relations, upserts records
- `services/ingestion-relation-resolver.service.ts` — Resolves relation fields by lookup during ingestion
- `services/ingestion-field-mapping.service.ts` — CRUD for field mappings
- `services/ingestion-log.service.ts` — Log queries and creation
- `controllers/ingestion-pipeline-webhook.controller.ts` — Push-mode webhook endpoint (receives external payloads)
- `jobs/ingestion-pull.job.ts` — BullMQ job: fetches data from source URL, processes records
- `jobs/ingestion-push-process.job.ts` — BullMQ job: processes pushed webhook payloads
- `jobs/ingestion-job.module.ts` — Job module registration
- `resolvers/ingestion-pipeline.resolver.ts` — GraphQL CRUD + test mutation
- `resolvers/ingestion-field-mapping.resolver.ts` — GraphQL CRUD for field mappings
- `resolvers/ingestion-log.resolver.ts` — GraphQL log queries
- `preprocessors/ingestion-preprocessor.registry.ts` — Registry for pipeline-specific preprocessors
- `preprocessors/old-crm-policy.preprocessor.ts` — Old CRM policy ingestion: person resolution, carrier/product creation, `parseDateTimeAsEastern()` for `submittedDate` (Eastern → UTC)
- `preprocessors/healthsherpa-policy.preprocessor.ts` — HealthSherpa policy ingestion preprocessor
- `preprocessors/convoso-call.preprocessor.ts` — Convoso call ingestion preprocessor
- `preprocessors/convoso-lead.preprocessor.ts` — Convoso lead ingestion preprocessor
- `utils/build-record-from-mappings.util.ts` — Builds record from field mappings + source data
- `utils/apply-field-transform.util.ts` — Field value transforms (date, number, etc.)
- `utils/extract-value-by-path.util.ts` — Dot-path value extraction from nested objects
- `database/typeorm/core/migrations/common/1771284860000-add-ingestion-pipeline-entities.ts` — **Migration** creating `ingestionPipeline`, `ingestionFieldMapping`, `ingestionLog` tables
- `database/typeorm/core/migrations/common/1771400000000-add-ingestion-log-incoming-payload.ts` — **Migration** adding `incomingPayload` column to `ingestionLog`

### `packages/twenty-server/src/modules/lead/`

- `query-hooks/lead-create-one.pre-query.hook.ts` — Lead pre-processing
- `query-hooks/lead-create-many.pre-query.hook.ts` — Same for bulk
- `query-hooks/person-create-one.pre-query.hook.ts` — Person/Lead creation hooks
- `query-hooks/person-create-many.pre-query.hook.ts` — Same for bulk
- `query-hooks/lead-query-hook.module.ts` — Module registration

## Modified Upstream Frontend Files

### Spreadsheet Import (CSV Import/Export)

| File                                                                                    | Modification                                                                          |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `spreadsheet-import/types/SpreadsheetImportField.ts`                                    | Added `isRelationUpdateField` and `targetFieldMetadataItem` properties                |
| `object-record/spreadsheet-import/hooks/useBuildSpreadSheetImportFields.ts`             | Added relation update fields to import dropdown                                       |
| `object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog.ts` | Execute relation updates after parent upsert                                          |
| `object-record/spreadsheet-import/utils/buildRecordFromImportedStructuredRow.ts`        | Explicit `isRelationConnectField` filter                                              |
| `object-record/object-options-dropdown/hooks/useExportProcessRecordsForCSV.ts`          | Keep composite fields as objects for proper sub-field export                          |
| `command-menu-item/record/multiple-records/components/ExportMultipleRecordsCommand.tsx` | Restore the related-fields modal before export when visible relations exist           |
| `command-menu-item/engine-command/record/multiple-records/components/ExportMultipleRecordsCommand.tsx` | Restore the related-fields modal in the engine-command export path             |
| `object-record/record-index/export/components/ExportRelationFieldConfigModal.tsx`       | Select relation export leaves by field path so nested relational fields can be chosen |
| `object-record/record-index/export/hooks/useExportableRelationFields.ts`                | Recursively enumerate exportable `MANY_TO_ONE` relation leaves                        |
| `object-record/record-index/export/hooks/useRecordIndexExportRecords.ts`                | Split composite relation sub-fields into separate CSV columns                         |
| `spreadsheet-import/utils/dataMutations.ts`                                             | Trim whitespace before validation                                                     |
| `spreadsheet-import/utils/normalizeTableData.ts`                                        | Trim whitespace on matched column values                                              |

### New Spreadsheet Import Utilities

| File                                                                                        | Purpose                                                 |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `object-record/spreadsheet-import/utils/executeRelationUpdatesViaMutation.ts`               | Execute batched createMany upserts for relation updates |
| `object-record/spreadsheet-import/utils/extractRelationUpdatesFromImportedRows.ts`          | Extract relation update data from imported rows         |
| `object-record/spreadsheet-import/utils/spreadsheetImportGetRelationUpdateSubFieldKey.ts`   | Key format for update fields                            |
| `object-record/spreadsheet-import/utils/spreadsheetImportGetRelationUpdateSubFieldLabel.ts` | Label format for update fields                          |

### New Export Utilities

| File                                                                  | Purpose                                                                                    |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `object-record/record-index/export/utils/relationExportFieldPaths.ts` | Builds recursive relation export field paths, nested GraphQL selections, and flat CSV keys |
| `object-record/record-index/export/types/ExportConfig.ts`             | Stores selected related export fields as dotted field paths (`selectedFieldPaths`)         |

### RLS and Permissions

| File                                                                  | Modification                                                            |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `object-record/hooks/useBuildRecordInputFromRLSPredicates.ts`         | **CRITICAL** — Indirect relation resolution for Agent → WorkspaceMember |
| `settings/roles/.../SettingsRolePermissionsObjectLevelObjectForm.tsx` | Removed Organization plan billing gate                                  |

### Action-Scoped RLS (Read vs Write)

| File                                                                                                                                     | Modification                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `settings/roles/.../record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelSection.tsx`                        | Splits record-level permissions into three builders: `Read + write`, `Read only`, `Write only`                   |
| `settings/roles/.../record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder.tsx`        | Builder instance ids are scope-specific so per-scope drafts do not bleed into each other                         |
| `settings/roles/.../record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilderContent.tsx` | Threads scope through initialization and draft sync                                                              |
| `settings/roles/.../record-level-permissions/hooks/useRecordLevelPermissionFilterInitialization.ts`                                      | Hydrates only predicates/groups for the selected object + scope                                                  |
| `settings/roles/.../record-level-permissions/hooks/useRecordLevelPermissionSyncToDraftRole.ts`                                           | Replaces only the selected object + scope slice when editing                                                     |
| `settings/roles/.../record-level-permissions/utils/recordLevelPermissionPredicateConversion.ts`                                          | Converts draft filters/groups into scoped predicates/groups                                                      |
| `settings/roles/role/hooks/useSaveDraftRoleToDB.ts`                                                                                      | Persists predicate/group `scope` back to GraphQL                                                                 |
| `generated-metadata/graphql.ts`                                                                                                          | Regenerated metadata GraphQL types include `RowLevelPermissionPredicateScope` and predicate/group `scope` fields |

**Omnia policy configuration target:**

- Member role should have no Policy `ALL` or `READ` row-level predicates.
- Member role should keep a `WRITE`-scoped Policy predicate matching policy ownership (`policy.agent`) to the current workspace member/agent chain.
- Result: agents can search and view all policies, but create/update/delete/restore is restricted to their own policies.

**Regression hit on March 11, 2026:**

- Symptom: `Member -> Policy -> Write only -> Agent is Me` looked correct in Settings, but policy create/edit still failed with `Record does not satisfy security constraints`.
- Root cause: the scoped RLS rollout correctly split `READ` vs `WRITE`, but relation-based dynamic `Me` predicates were still treating `workspaceMember.id` as if it matched `policy.agentId` directly. For policies, the real path is `policy.agentId -> agentProfile.id -> agentProfile.workspaceMemberId -> workspaceMember.id`.
- Frontend fix: `useBuildRecordInputFromRLSPredicates.ts` now only uses `ALL + WRITE` predicates for record creation and pre-resolves the intermediate relation record ID before prefilling `agentId`. `useFilteredSelectOptionsFromRLSPredicates.ts` also limits editable option filtering to `ALL + WRITE`.
- Backend fix: `build-row-level-permission-record-filter.util.ts` now resolves relation-based `Me` predicates through the relation target object's link back to `workspaceMember`, then builds the final filter against the resolved related record IDs.
- Why pre-query hooks were not enough: Omnia's policy pre-query hooks still auto-assign `agentId`, but backend `WRITE`-scope RLS validation runs independently and must also understand the `workspaceMember -> agentProfile -> policy.agent` chain.
- Regression coverage: `packages/twenty-server/src/engine/twenty-orm/utils/__tests__/build-row-level-permission-record-filter.util.spec.ts` covers the exact `policy.agent = Me` relation-resolution case.

**Performance regression hit on March 11, 2026:**

- Symptom: production GraphQL requests became extremely slow after the scoped RLS rollout even though server pods were healthy and under low CPU load.
- Root cause: the new relation-aware RLS builder was recomputing the same role/object/scope filter and re-resolving the same linked-record IDs many times within a single GraphQL request as resolvers fanned out.
- Backend fix: `workspace-entity-manager.ts` now seeds a request-scoped RLS computation cache into the AsyncLocal ORM workspace context, and `build-row-level-permission-record-filter.util.ts` memoizes both resolved relation values and final record filters per request. `apply-row-level-permission-predicates.util.ts` and `validate-rls-predicates-for-records.util.ts` both reuse that same cache.
- Files that matter: `engine/twenty-orm/types/workspace-rls-computation-cache.type.ts`, `engine/twenty-orm/storage/orm-workspace-context.storage.ts`, `engine/twenty-orm/interfaces/workspace-internal-context.interface.ts`, `engine/twenty-orm/entity-manager/workspace-entity-manager.ts`, and `engine/twenty-orm/utils/build-row-level-permission-record-filter.util.ts`.
- Regression coverage: `packages/twenty-server/src/engine/twenty-orm/utils/__tests__/build-row-level-permission-record-filter.util.spec.ts` now verifies identical relation-based RLS computations are reused within one request context instead of hitting the database repeatedly.

**Metadata endpoint audit on March 11, 2026:**

- Finding: the latest scoped-RLS hotfix does not materially affect `FindAllRecordPageLayouts`, because page layouts are served from `PageLayoutService` via workspace flat-entity caches, not the ORM RLS query builder.
- Finding: `ObjectMetadataItems` is forced through `network-only` on app boot, but is protected by the metadata response cache. `FindAllRecordPageLayouts`, `FindFieldsWidgetCoreViews`, and `FindManyLogicFunctions` are also part of the boot metadata load path and were not cached server-side.
- Backend fix: `metadata.module-factory.ts` now caches those boot metadata operations, and `use-cached-metadata.ts` treats `FindFieldsWidgetCoreViews` like `FindAllCoreViews` by keeping the cache key user-scoped.
- Files that matter: `engine/api/graphql/metadata.module-factory.ts`, `engine/api/graphql/graphql-config/hooks/use-cached-metadata.ts`, `modules/users/components/LazyMetadataLoadEffect.tsx`, and `modules/metadata-store/effect-components/ObjectMetadataProviderInitialEffect.tsx`.

**GraphQL / metadata observability pass on March 11, 2026:**

- Goal: capture the next prod slowdown without adding per-request log spam or meaningful runtime overhead.
- Shared helper: `slow-path-observer.util.ts` centralizes thresholded timing warnings so future audits can instrument hot paths without hand-rolling timers or logging every request.
- Metadata instrumentation: `use-cached-metadata.ts` now records timing only for cache misses and warns when a miss crosses the slow threshold via the shared helper.
- Cache instrumentation: `workspace-cache.service.ts` now warns separately for slow Redis hash validation, slow Redis data fetches, slow provider recomputes, and slow overall workspace-cache resolution via the shared helper.
- Core GraphQL instrumentation: `graphql-config.service.ts` now warns when schema resolution is slow, splitting `moduleRef.resolve()` from `WorkspaceSchemaFactory.createGraphQLSchema()` via the shared helper.
- Schema build instrumentation: `workspace-schema.factory.ts` now warns with stage timings for data-source lookup, flat-map fetch, metadata-version fetch, schema-artifact cache lookup, schema generation, resolver creation, and `makeExecutableSchema()` via the shared helper.
- Why this matters: local remained fast while prod was slow, so we need cheap evidence to distinguish edge/network issues from Redis/cache misses versus core schema construction.

### Relation Picker Filtering (Policy Assignment)

| File                                                                                                 | Modification                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `record-field-list/.../RecordDetailRelationSectionDropdownToOne.tsx`                                 | Junction bridge filter fix + resolves dependency filter to id-based via `useFindManyRecords` (search API can't filter by object-specific fields like `carrierId`) |
| `record-field-list/.../RecordDetailRelationSectionDropdownToMany.tsx`                                | Allowlists only eligible policies (`leadId` is null or the current lead) in the lead detail sidebar policy picker                                                 |
| `record-picker/single-record-picker/components/SingleRecordPicker.tsx`                               | Passes `additionalFilter` through to `SingleRecordPickerMenuItemsWithSearch` (was silently dropped)                                                               |
| `record-picker/multiple-record-picker/components/MultipleRecordPicker.tsx`                           | Restores shared `additionalFilter` prop/state sync for multi-select relation pickers                                                                              |
| `record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch.ts`                 | Combines `additionalFilter` with selected/excluded ID filters so lead policy allowlists persist across typing/load-more                                           |
| `record-picker/multiple-record-picker/states/multipleRecordPickerExcludedRecordIdsComponentState.ts` | **NEW** — Atom for persisting excluded record IDs across picker searches                                                                                          |
| `record-picker/hooks/useLeadPolicyRecordPickerAdditionalFilter.ts`                                   | **NEW** — Central helper building the lead → policy allowlist filter (`leadId` null or current lead only)                                                         |
| `record-field/ui/meta-types/input/components/RelationOneToManyFieldInput.tsx`                        | Reuses the same lead-policy allowlist filter for inline/table-cell policy pickers and waits for it before showing results                                         |
| `record-field/ui/meta-types/input/hooks/useOpenRelationFromManyFieldInput.tsx`                       | Removed `performSearch` — initial search moved to `RelationOneToManyFieldInput` so the lead-policy allowlist is ready before any picker results show              |
| `record-field/ui/hooks/useOpenFieldInputEditMode.ts`                                                 | Removed unused `excludedRecordIds` param                                                                                                                          |

### Required Fields (Per-Field Validation with Conditional Rules)

| File                                                                                                        | Modification                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings/data-model/fields/forms/components/SettingsDataModelFieldRequiredForm.tsx`                        | **NEW** — Required toggle + conditional rule builder (Always / When [field] is [empty/not empty])                                                     |
| `settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard.tsx`                    | Added `requiredCondition` to all field type form schemas + renders Required form                                                                      |
| `settings/data-model/fields/forms/number/components/SettingsDataModelFieldNumberSettingsFormCard.tsx`       | Added Required form                                                                                                                                   |
| `settings/data-model/fields/forms/components/text/SettingsDataModelFieldTextSettingsFormCard.tsx`           | Added Required form                                                                                                                                   |
| `settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateSettingsFormCard.tsx`           | Added Required form                                                                                                                                   |
| `settings/data-model/fields/forms/phones/components/SettingsDataModelFieldPhonesSettingsFormCard.tsx`       | Added Required form                                                                                                                                   |
| `settings/data-model/fields/forms/address/components/SettingsDataModelFieldAddressSettingsFormCard.tsx`     | Added Required form                                                                                                                                   |
| `settings/data-model/fields/forms/boolean/components/SettingsDataModelFieldBooleanSettingsFormCard.tsx`     | Added Required form                                                                                                                                   |
| `settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencySettingsFormCard.tsx`   | Added Required form                                                                                                                                   |
| `settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectSettingsFormCard.tsx`       | Added Required form                                                                                                                                   |
| `settings/data-model/fields/forms/morph-relation/components/SettingsDataModelFieldRelationFormCard.tsx`     | Added Required form                                                                                                                                   |
| `object-metadata/utils/formatFieldMetadataItemInput.ts`                                                     | Added `requiredCondition` to field update payload                                                                                                     |
| `object-metadata/hooks/useUpdateOneFieldMetadataItem.ts`                                                    | Added `requiredCondition` to mutation payload type                                                                                                    |
| `object-metadata/graphql/fragment.ts`                                                                       | Added `requiredCondition` to `fieldsList` GraphQL fragment                                                                                            |
| `object-metadata/utils/formatFieldMetadataItemAsFieldDefinition.ts`                                         | Passes `requiredCondition` into `FieldDefinition`                                                                                                     |
| `object-record/record-field/ui/types/FieldDefinition.ts`                                                    | Added `RequiredCondition` type and `requiredCondition` field                                                                                          |
| `object-record/record-inline-cell/components/RecordInlineCellDisplayMode.tsx`                               | Removed `useIsFieldRequired` from table cells (perf: 900+ jotai subs); required indicators only in sidebar detail view                                |
| `object-record/record-field/ui/hooks/useIsFieldRequired.ts`                                                 | **NEW** — Hook evaluating `requiredCondition` against current field/record state                                                                      |
| `object-record/record-field-list/record-detail-section/components/RecordDetailSectionContainer.tsx`         | Red title label when `isRequired` prop is true (non-widget layout path)                                                                               |
| `object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationSection.tsx` | Passes `isRequired` from `useIsFieldRequired` to section container                                                                                    |
| `page-layout/widgets/field/components/FieldWidget.tsx`                                                      | Computes `isRequiredEmpty` for relation widgets, sets widget-level state for red title; setter removed from useEffect deps (perf: prevents ~20 spurious state updates per record load) |
| `page-layout/widgets/widget-card/components/WidgetCardHeader.tsx`                                           | Added `isRequiredEmpty` prop — turns title red when relation is required and empty                                                                    |
| `page-layout/widgets/components/WidgetRenderer.tsx`                                                         | Reads `widgetCardRequiredEmptyComponentFamilyState` and passes to `WidgetCardHeader`                                                                  |
| `page-layout/widgets/states/widgetCardRequiredEmptyComponentFamilyState.ts`                                 | **NEW** — Jotai family state for per-widget required-empty status                                                                                     |
| `generated-metadata/graphql.ts`                                                                             | Added `requiredCondition` to Field type, CreateFieldInput, UpdateFieldInput, and all query fragments                                                  |
| `object-record/record-field/ui/hooks/useRecordRequiredFieldViolations.ts`                                   | **NEW** — Batch validation: returns all required-field violations for a record (used by close validation)                                             |
| `object-record/record-side-panel/states/newlyCreatedRecordIdsState.ts`                                      | **NEW** — Jotai atom tracking record IDs created via the side panel (was `record-right-drawer/`)                                                      |
| `side-panel/hooks/useOpenRecordInSidePanel.ts`                                                              | Adds record ID to `newlyCreatedRecordIdsState` when `isNewRecord: true` (was `command-menu/hooks/useOpenRecordInCommandMenu.ts`)                      |
| `command-menu/hooks/useCommandMenuCloseWithValidation.ts`                                                   | **NEW** — Wraps close/back with required-field validation; skips soft-deleted new records so delete can close cleanly                                 |
| `command-menu/states/requiredFieldsValidationState.ts`                                                      | **NEW** — Jotai atom for pending validation modal data                                                                                                |
| `command-menu/components/RequiredFieldsValidationModal.tsx`                                                 | **NEW** — Confirmation modal: "Delete Record" or "Go Back" when required fields are empty                                                             |
| `side-panel/components/SidePanelTopBar.tsx`                                                                 | X button uses `closeWithValidation` instead of `closeSidePanelMenu` (was `CommandMenuTopBar.tsx`)                                                     |
| `command-menu/components/CommandMenuOpenContainer.tsx`                                                      | Click-outside uses `closeWithValidation` instead of `closeSidePanelMenu`                                                                              |
| `side-panel/components/SidePanelBackButton.tsx`                                                             | Back button uses `goBackWithValidation` instead of `goBackFromSidePanel` (was `CommandMenuBackButton.tsx`)                                            |
| `command-menu/hooks/useCommandMenuHotKeys.ts`                                                               | Escape/Backspace/Delete use `goBackWithValidation` instead of `goBackFromSidePanel`                                                                   |
| `side-panel/components/SidePanelForDesktop.tsx`                                                             | Collapse uses `closeWithValidation`; renders `RequiredFieldsValidationModal`; cleanup + beforeunload hooks (was `CommandMenuSidePanelForDesktop.tsx`) |
| `command-menu/hooks/useBeforeUnloadRequiredFieldsCheck.ts`                                                  | **NEW** — Blocks browser refresh/close when non-deleted newly created records have required field violations                                          |
| `command-menu/hooks/useCleanupNewlyCreatedRecordIds.ts`                                                     | **NEW** — Prunes stale or deleted record IDs from sessionStorage on app startup                                                                       |
| `command-menu/hooks/__tests__/useCommandMenuCloseWithValidation.test.tsx`                                   | **NEW** — Regression test: deleted new records bypass required-fields close/back modal                                                                |
| `object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer.ts`                 | Added `isNewRecord: true` so "Add new" from relation fields is tracked for validation                                                                 |

### Other Frontend

| File                                                                                                                        | Modification                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `packages/twenty-front/src/modules/command-menu/components/CommandMenuButton.tsx`                                           | Pinned command buttons honor per-command `buttonVariant` / `accent` so object index pages can render a filled primary CTA       |
| `packages/twenty-front/src/modules/command-menu-item/record/constants/DefaultRecordCommandMenuItemsConfig.tsx`              | Create-record action defaults to blue primary CTA                                                                               |
| `packages/twenty-front/src/modules/command-menu-item/hooks/useRegisteredCommandMenuItems.ts`                                | Applies object-aware create CTA labels after command registration                                                               |
| `packages/twenty-front/src/modules/command-menu-item/utils/resolveCreateRecordActionLabels.ts`                              | **NEW** — Rewrites generic create-record action into `Create Policy`, `Create Lead`, etc. using object metadata                 |
| `packages/twenty-front/src/modules/command-menu-item/server-items/hooks/useCommandMenuItemFrontComponentCommands.tsx`       | Server-side command menu items: `CREATE_NEW_RECORD` gets object-specific label + blue CTA; `GO_TO_*` uses custom labels + filters deactivated objects |
| `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant.ts` | Pin Delete single/multiple record actions so they appear as header buttons (upstream has `isPinned: false`, hiding them in dropdown) |
| `packages/twenty-front/src/modules/command-menu-item/utils/resolveGoToActionLabels.ts`                                    | **NEW** — Resolves "Go to" labels from object metadata (`labelPlural`) and filters deactivated objects                          |
| `packages/twenty-front/src/modules/command-menu-item/record-agnostic/constants/RecordAgnosticCommandMenuItemsConfig.tsx`   | "Edit navigation sidebar" gated behind `LAYOUTS` permission so members can't see it                                             |
| `packages/twenty-front/src/modules/navigation-menu-item/components/WorkspaceNavigationMenuItemsDispatcher.tsx`              | Restores admin/member split: only `LAYOUTS` users get editable workspace navigation; members use the fixed Omnia workspace list |
| `packages/twenty-front/src/modules/navigation-menu-item/components/WorkspaceNavigationMenuItems.tsx`                        | Re-gates workspace sidebar editing behind `PermissionFlagType.LAYOUTS`                                                          |
| `packages/twenty-front/src/modules/navigation-menu-item/display/dnd/components/OmniaMemberWorkspaceNavigationMenuItems.tsx` | **NEW** — Permission-driven workspace sidebar for non-layout users; renders objects filtered by `showInSidebar` per role         |
| `packages/twenty-front/src/modules/navigation-menu-item/display/sections/components/NavigationDrawerOpenedSection.tsx`      | Deduplicates "Opened" section using `showInSidebar` permission instead of hardcoded list                                        |
| `packages/twenty-front/src/modules/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems.tsx`            | Supports preserving caller-provided ordering and `ignoreShowInSidebar` bypass for curated sections                              |
| `packages/twenty-ui/src/navigation/link/components/AudioLink.tsx`                                                           | **NEW** — Audio player component for call recordings (inline pill with `<audio>` controls)                                      |
| `packages/twenty-front/src/modules/auth/components/Logo.tsx`                                                                | When workspace logo exists and no custom primary logo set, show workspace logo as primary instead of Twenty "20" icon overlay   |
| `packages/twenty-front/src/pages/auth/SignInUp.tsx`                                                                         | Show just the workspace name instead of "Welcome, X." on sign-in page                                                          |
| `packages/twenty-front/src/modules/metadata-store/states/metadataStoreState.ts`                                             | Use lz-string compressed localStorage adapter — upstream raw JSON exceeds Safari's 5MB quota                                    |
| `packages/twenty-front/src/modules/ui/utilities/state/jotai/utils/createAtomFamilyState.ts`                                 | Added `customStringStorage` option to support compressed localStorage adapter                                                   |
| `packages/twenty-front/src/modules/ui/utilities/state/jotai/utils/createCompressedLocalStorage.ts`                          | **NEW** — lz-string compressed `SyncStringStorage` adapter for Jotai `atomWithStorage`                                          |
| `packages/twenty-front/src/modules/metadata-store/hooks/useLoadMinimalMetadata.ts`                                           | Treat missing collection hashes as stale when local store is empty — fixes nav items lost after Redis flush                     |
| `packages/twenty-server/src/engine/metadata-modules/minimal-metadata/minimal-metadata.service.ts`                            | Fire-and-forget cache priming for entity keys missing from Redis — ensures hashes exist for subsequent requests                 |

### Frontend Performance

| File                                                                                                              | Modification                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/twenty-front/src/modules/apollo/components/ApolloProvider.tsx`                                          | Removed `apollo3-cache-persist` — it blocked initial render with no timeout; metadata is small and re-fetched quickly                                         |
| `packages/twenty-front/src/modules/object-record/hooks/useObjectPermissions.ts`                                   | Memoized `.reduce()` with `useMemo` — was called 300+ times per table render creating new objects each time                                                   |
| `packages/twenty-front/src/modules/sse-db-event/hooks/useDispatchObjectRecordEventsFromSseToBrowserEvents.ts`     | Use `store.get()` snapshot instead of `useObjectMetadataItems()` hook — prevents SSE re-subscription on every metadata change                                 |
| `packages/twenty-front/src/modules/object-record/hooks/useLazyFindManyRecordsWithOffset.ts`                       | `fetchPolicy: 'no-cache'` — record table reads from jotai, not Apollo cache; Apollo 3 has no cache GC, so caching here causes unbounded memory growth → OOM |
| `packages/twenty-front/src/modules/object-record/record-index/hooks/useRecordIndexTableFetchMore.ts`             | `fetchPolicy: 'no-cache'` — same reason: prevents Apollo 3 double-storing records that are already in jotai                                                  |
| `packages/twenty-front/src/modules/apollo/components/ApolloProvider.tsx`                                          | `connectToDevTools` gated to development only — was hardcoded `true`, wasting memory on production Apollo DevTools instrumentation                            |
| `record-table/record-table-cell/components/RecordTableCellFieldContextGeneric.tsx`                                | Memoized `FieldContext.Provider` value — rendered per cell (O(rows × fields)), prevents cascading re-renders from new object refs                             |
| `record-table/record-table-cell/components/RecordTableCellFieldContextLabelIdentifier.tsx`                        | Memoized `FieldContext.Provider` value + `useCallback` for chip click handler                                                                                 |
| `record-table/record-table-cell/components/RecordTableCellBaseContainer.tsx`                                      | `useCallback` for click handler — created per cell, prevents re-render from new function ref                                                                  |
| `record-table/components/RecordTableScrollAndZIndexEffect.tsx`                                                    | Rewrote scroll handler to use `store.get()`/`store.set()` — original used reactive hooks in deps, causing listener teardown/reattach loop that crashed mobile Safari |
| `record-table/record-table-cell/components/RecordTableCellWrapper.tsx`                                            | Memoized `RecordTableCellContext.Provider` value — inline object literal caused all cell context consumers to re-render on every parent re-render              |
| `record-table/record-table-row/components/RecordTableTr.tsx`                                                      | Memoized `RecordTableRowContextProvider` value — inline object literal caused all row context consumers to re-render on every parent re-render                 |

## Modified Upstream Server Files

### Application Deployment

| File                                                                            | Modification                                                                              |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `engine/core-modules/application/resolvers/application-development.resolver.ts` | Removed `DevelopmentGuard` — allows `app:dev` deployment on self-hosted production server |
| `.github/workflows/deploy-eks.yaml`                                             | Added `APP_VERSION=1.20.0` build arg so upgrade migrations run on deploy                  |

### Cloudflare / Asset Caching

| File                                                   | Modification                                                                                                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/twenty-server/src/app.module.ts`             | Excludes `/assets/*` and `/images/*` from the SPA fallback so missing hashed assets return real 404s, and sets `no-store` on HTML                   |
| `packages/twenty-docker/helm/twenty/omnia-values.yaml` | Nginx ingress adds `immutable` cache headers for successful JS/CSS/fonts/images only, and `no-cache, no-store, must-revalidate` for HTML/app routes |

### GraphQL Metadata Response Caching

| File                                                                                        | Modification                                                                                                                                                      |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/twenty-server/src/engine/api/graphql/metadata.module-factory.ts`                  | Metadata response cache includes `ObjectMetadataItems`, `FindAllCoreViews`, `FindFieldsWidgetCoreViews`, `FindAllRecordPageLayouts`, and `FindManyLogicFunctions` |
| `packages/twenty-server/src/engine/api/graphql/graphql-config/hooks/use-cached-metadata.ts` | Core-view operations `FindAllCoreViews` and `FindFieldsWidgetCoreViews` stay user-scoped in the cache key                                                         |

### RLS / Permissions Engine

| File                                                                                                        | Modification                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `engine/twenty-orm/utils/build-row-level-permission-record-filter.util.ts`                                  | Indirect relation support, deny-by-default when predicates can't resolve, action-scoped predicate filtering, and request-scoped memoization |
| `engine/twenty-orm/utils/apply-row-level-permission-predicates.util.ts`                                     | Applies `READ` predicates to queries and `WRITE` predicates to update/delete/restore query builders                                         |
| `engine/twenty-orm/utils/validate-rls-predicates-for-records.util.ts`                                       | RLS validation on create/update now always enforces `WRITE`-scoped predicates                                                               |
| `engine/twenty-orm/utils/__tests__/build-row-level-permission-record-filter.util.spec.ts`                   | Regression test covering relation-based `policy.agent = Me` resolution through the linked AgentProfile record                               |
| `engine/workspace-event-emitter/workspace-event-emitter.service.ts`                                         | Event-stream subscriptions use `READ`-scoped predicates                                                                                     |
| `engine/api/common/common-select-fields/utils/filter-restricted-fields-from-select.util.ts`                 | **NEW** — Strip restricted fields instead of rejecting queries                                                                              |
| `engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service.ts` | Rejects mixed-scope predicate trees so groups/predicates stay internally consistent                                                         |
| `database/typeorm/core/migrations/common/1773079000000-add-scope-to-row-level-permission-predicates.ts`     | **NEW** migration adding `scope` to predicates and predicate groups, defaulting existing rows to `ALL`                                      |
| `engine/twenty-orm/types/workspace-rls-computation-cache.type.ts`                                           | **NEW** request-scoped cache for computed RLS filters and resolved linked-record ids                                                        |
| `engine/twenty-orm/storage/orm-workspace-context.storage.ts`                                                | AsyncLocal workspace context now carries the request-scoped RLS cache                                                                       |
| `engine/twenty-orm/interfaces/workspace-internal-context.interface.ts`                                      | Internal ORM context exposes the request-scoped RLS cache to all query builders                                                             |
| `engine/twenty-orm/entity-manager/workspace-entity-manager.ts`                                              | Initializes one RLS cache per request so GraphQL resolvers reuse the same filter/link-resolution work                                       |

### Shared Types: Action-Scoped RLS

| File                                                                                                                                            | Modification                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `packages/twenty-shared/src/types/RowLevelPermissionPredicateScope.ts`                                                                          | **NEW** shared enum defining `ALL`, `READ`, and `WRITE` predicate scopes |
| `packages/twenty-shared/src/types/RowLevelPermissionPredicate.ts`                                                                               | Added `scope` to shared predicate type                                   |
| `packages/twenty-shared/src/types/RowLevelPermissionPredicateGroup.ts`                                                                          | Added `scope` to shared predicate-group type                             |
| `packages/twenty-server/src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity.ts`           | Added persisted predicate `scope` column                                 |
| `packages/twenty-server/src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity.ts`     | Added persisted predicate-group `scope` column                           |
| `packages/twenty-server/src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto.ts`                  | Exposes predicate `scope` over GraphQL                                   |
| `packages/twenty-server/src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto.ts`            | Exposes predicate-group `scope` over GraphQL                             |
| `packages/twenty-server/src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input.ts` | Allows scope-aware predicate/group upserts                               |

### Global Search / Custom Object Search Coverage

| File                                                                                                                     | Modification                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `engine/core-modules/search/services/search.service.ts`                                                                  | Custom objects get an all-searchable-field fallback query in addition to the normal `searchVector` full-text path                                |
| `engine/metadata-modules/search-field-metadata/utils/build-custom-object-search-vector-field-settings.util.ts`           | **NEW** — Central helper that builds custom-object `searchVector` expressions from all active searchable custom fields                           |
| `engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util.ts`             | Default custom-object `searchVector` now uses the shared helper instead of hardcoding label-only behavior                                        |
| `engine/metadata-modules/field-metadata/services/field-metadata.service.ts`                                              | Recomputes custom-object `searchVector` on field create/delete so new fields like `policyNumber` become searchable without manual metadata fixes |
| `engine/metadata-modules/flat-field-metadata/utils/handle-flat-field-metadata-update-side-effect.util.ts`                | Field update side effects now trigger generic custom-object `searchVector` recomputation, not just label-identifier changes                      |
| `engine/metadata-modules/flat-field-metadata/utils/handle-search-vector-changes-during-field-update.util.ts`             | **NEW** — Rebuilds custom-object `searchVector` when a field name/type/active/system flag changes                                                |
| `engine/metadata-modules/flat-object-metadata/utils/recompute-search-vector-field-after-label-identifier-update.util.ts` | Label-identifier changes preserve all searchable custom fields in `searchVector` instead of collapsing back to one field                         |
| `engine/workspace-manager/utils/get-ts-vector-column-expression.util.ts`                                                 | Exported per-field searchable column expansion helper so both `searchVector` generation and runtime fallback search share the same field logic   |
| `database/typeorm/core/migrations/common/1771600000000-add-policy-number-and-rename.ts`                                  | Policy `policyNumber` is stored as `TEXT`; search must continue indexing/searching it even though `name` is repurposed as a display label        |
| `modules/policy/query-hooks/policy-create-one.pre-query.hook.ts`                                                         | Policy `name` is auto-derived from carrier/product, so policy-number search depends on the custom search coverage above                          |
| `modules/policy/query-hooks/policy-update-one.pre-query.hook.ts`                                                         | Same on update — policy display name stays derived, not policy-number-based                                                                      |

### Configurable Edit Window (Per-Role, Per-Object)

| File                                                                                            | Modification                                                                                                                        |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `engine/metadata-modules/role/role.entity.ts`                                                   | Added `editWindowMinutes` column (nullable integer) — global default per role                                                       |
| `engine/metadata-modules/object-permission/object-permission.entity.ts`                         | Added `editWindowMinutes` column (nullable integer) — per-object override                                                           |
| `engine/metadata-modules/role/dtos/role.dto.ts`                                                 | Added `editWindowMinutes` GraphQL field                                                                                             |
| `engine/metadata-modules/role/dtos/update-role.input.ts`                                        | Added `editWindowMinutes` input field                                                                                               |
| `engine/metadata-modules/role/dtos/create-role.input.ts`                                        | Added `editWindowMinutes` input field                                                                                               |
| `engine/metadata-modules/object-permission/dtos/object-permission.dto.ts`                       | Added `editWindowMinutes` GraphQL field                                                                                             |
| `engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input.ts`             | Added `editWindowMinutes` input field                                                                                               |
| `engine/metadata-modules/role/services/workspace-roles-permissions-cache.service.ts`            | Resolves `editWindowMinutes`: object override → role default → null (no restriction)                                                |
| `engine/metadata-modules/role/utils/fromRoleEntityToRoleDto.util.ts`                            | Maps `editWindowMinutes` to DTO                                                                                                     |
| `engine/metadata-modules/flat-role/utils/from-create-role-input-to-flat-role-to-create.util.ts` | Includes `editWindowMinutes` in role creation                                                                                       |
| `engine/metadata-modules/flat-role/utils/from-role-entity-to-flat-role.util.ts`                 | Includes `editWindowMinutes` in flat role                                                                                           |
| `engine/core-modules/application/utils/from-role-manifest-to-universal-flat-role.util.ts`       | Defaults `editWindowMinutes: null`                                                                                                  |
| `engine/workspace-manager/.../create-standard-role-flat-metadata.util.ts`                       | Defaults `editWindowMinutes: null` for standard roles                                                                               |
| `engine/twenty-orm/utils/compute-permission-intersection.util.ts`                               | Includes `editWindowMinutes: null` in permission intersection                                                                       |
| `database/typeorm/core/migrations/common/1772591146793-add-edit-window-minutes.ts`              | **NEW** migration adding column to `role` and `objectPermission` tables                                                             |
| `database/typeorm/core/migrations/common/1772600000000-change-submitted-date-to-datetime.ts`    | **NEW** migration changing policy `submittedDate` from DATE to DATE_TIME (timestamptz), converts existing dates as Eastern midnight |

**Frontend — Edit Window UI:**
| File | Modification |
|------|-------------|
| `settings/roles/.../SettingsRolePermissionsObjectLevelEditWindowRow.tsx` | **NEW** — Duration selector row (No limit, 5min–7 days) in object permissions form |
| `settings/roles/.../SettingsRolePermissionsObjectLevelObjectFormObjectLevel.tsx` | Added `EditWindowRow` below existing permission checkboxes |
| `settings/roles/graphql/fragments/roleFragment.ts` | Added `editWindowMinutes` to query |
| `settings/roles/graphql/fragments/objectPermissionFragment.ts` | Added `editWindowMinutes` and `showInSidebar` to query |
| `settings/roles/role/hooks/useSaveDraftRoleToDB.ts` | Includes `editWindowMinutes` in create/update role + object permission upsert payloads |

**Shared types:**
| File | Modification |
|------|-------------|
| `packages/twenty-shared/src/types/ObjectPermissions.ts` | Added `editWindowMinutes: number \| null` |

### Required Fields (Field Metadata Extension)

| File                                                                                                                   | Modification                                                          |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------ | ------------------------------------ |
| `engine/metadata-modules/field-metadata/field-metadata.entity.ts`                                                      | Added `requiredCondition` JSONB column (`{type: 'always'              | 'fieldEmpty' | 'fieldNotEmpty', fieldId?: string}`) |
| `engine/metadata-modules/field-metadata/dtos/field-metadata.dto.ts`                                                    | Added `requiredCondition` GraphQL field                               |
| `engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util.ts`             | Added `requiredCondition` to DTO mapping (read path)                  |
| `engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant.ts`            | Added `requiredCondition` to custom + standard editable properties    |
| `engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-relation-properties-to-compare.constant.ts` | Added `requiredCondition` to relation field editable properties       |
| `engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant.ts`        | Added `requiredCondition` property config                             |
| `database/typeorm/core/migrations/common/1773069763255-add-field-metadata-required.ts`                                 | **NEW** migration adding `requiredCondition` to `fieldMetadata` table |

### Standard Object Index (Unique Constraints)

| File                                                                               | Modification                                                                     |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `engine/workspace-manager/.../compute-person-standard-flat-field-metadata.util.ts` | Emails `isUnique: false`, Phones `isUnique: true` (upstream default is reversed) |
| `engine/workspace-manager/.../compute-person-standard-flat-index-metadata.util.ts` | Phone is unique (not email)                                                      |

### Invitation Email Branding

| File                                                                                     | Modification                                        |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `engine/core-modules/workspace-invitation/services/workspace-invitation.service.ts`      | Removed "(via Twenty)" from invitation email sender  |

## Fragile Import Dependencies (Check After Upstream Renames)

Our custom files import from upstream modules that may be renamed/moved. After merging, grep for broken imports:

```bash
npx nx typecheck twenty-front  # Catches TS2307 "Cannot find module" errors
npx nx typecheck twenty-ui     # AudioLink etc.
```

| Our Custom File                                           | Imports From (upstream)                                                                                  | Previously Was                                                                      |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `command-menu/hooks/useCommandMenuCloseWithValidation.ts` | `@/side-panel/hooks/useSidePanelMenu`, `@/side-panel/hooks/useSidePanelHistory`, `@/side-panel/states/*` | `@/command-menu/hooks/useCommandMenu`, `@/command-menu/hooks/useCommandMenuHistory` |
| `command-menu/hooks/useCommandMenuHotKeys.ts`             | `@/side-panel/hooks/useSidePanelMenu`, `@/side-panel/constants/*`                                        | `@/command-menu/hooks/useCommandMenu`                                               |
| `command-menu/components/CommandMenuOpenContainer.tsx`    | `@/side-panel/types/*`, `@/side-panel/constants/*`                                                       | `@/command-menu/types/*`                                                            |
| `navigation/components/MainNavigationDrawer.tsx`          | `@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel`                                                 | `@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu`                        |
| `side-panel/hooks/useOpenRecordInSidePanel.ts`            | `@/object-record/record-side-panel/states/newlyCreatedRecordIdsState`                                    | `@/object-record/record-right-drawer/states/...`                                    |
| `packages/twenty-ui/.../AudioLink.tsx`                    | `@ui/theme-constants` (for `ThemeContext`)                                                               | Was `@ui/theme`                                                                     |
| `settings/.../EditWindowRow.tsx`                          | `twenty-ui/theme-constants` (for `ThemeContext`)                                                         | Was `twenty-ui/theme`                                                               |

## Mock Data (Deactivated Objects)

Mock metadata loaded during sign-out (`useLoadMockedMinimalMetadata`) must match Omnia's workspace state. Company and Opportunity are deactivated in Omnia but active in upstream Twenty.

| File | Modification |
| --- | --- |
| `testing/mock-data/generated/metadata/objects/mock-objects-metadata.ts` | Set `isActive: false` for Company and Opportunity objects |
| `testing/mock-data/generated/metadata/minimal/mock-minimal-metadata.ts` | Set `isActive: false` for Company and Opportunity objects |
| `testing/mock-data/generated/metadata/views/mock-views-data.ts` | Removed Company TABLE view, Opportunity TABLE view, and Opportunity KANBAN view |

## Post-Merge Checklist

After every upstream merge:

1. **Run the check script**: `./scripts/check-customizations.sh`
2. **Run typecheck**: `npx nx typecheck twenty-front && npx nx typecheck twenty-ui` — catches broken imports from upstream renames
3. **Re-extract Lingui**: `npx nx run twenty-front:lingui:extract && npx nx run twenty-front:lingui:compile`
4. **Verify policy create under write-only RLS**: Settings → Roles → Member → Permissions → Policy → Record-level should be `Write only: Agent is Me`; then log in as a member and create a policy from Policies page without hitting `Record does not satisfy security constraints`
5. **Verify sidebar/header**: Settings at top, no Documentation link, Search in sidebar, no inline search icon beside workspace name
6. **Verify member login redirect**: Log in as member — should land on People (Leads), not alphabetical first object
7. **Verify RLS settings UI**: No "Upgrade to access" gate on Record-level permissions
8. **Verify scoped RLS UI**: Settings → Roles → Member → Permissions → Policy → Record-level shows `Read + write`, `Read only`, and `Write only`
9. **Verify policy scoped RLS behavior**: Member can open/search all policies, create policies for themselves, and only edit/delete/restore policies they own; Policy `WRITE` rule persists while `ALL`/`READ` scopes stay empty
10. **Verify edit window**: Settings → Roles → Member → Permissions → Policy → "Edit window" dropdown present, saves correctly
11. **Verify required fields**: Settings → Data Model → Policy → any field → "Required" toggle present with condition options
12. **Verify uniqueness flags**: Emails `isUnique: false`, Phones `isUnique: true` in `compute-person-standard-flat-field-metadata.util.ts`
13. **Verify create CTA**: Policies/Leads/etc. index page shows a filled blue `Create Policy` / `Create Lead` header button, not outlined `New record`
13a. **Verify command menu labels**: Cmd+K menu shows `Go to Leads` (not `Go to People`), deactivated objects don't appear, and `Edit navigation sidebar` is hidden for members
14. **Verify member workspace sidebar**: Member role cannot edit workspace items; workspace section shows Leads, Calls, Policies, Notes, Tasks; Carriers folder is absent
15. **Run lint**: `npx nx lint:diff-with-main twenty-front`
16. **Run migrations**: `npx nx run twenty-server:database:migrate:prod`
17. **Flush Redis after deploy**: `cache:flat-cache-invalidate --all-metadata`
