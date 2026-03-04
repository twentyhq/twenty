# Omnia CRM Customizations

This document tracks all modifications made on top of upstream [twentyhq/twenty](https://github.com/twentyhq/twenty). **Check this file after every upstream merge** to verify nothing was overwritten.

Use `OMNIA-CUSTOM` markers in code to tag custom sections. After merging upstream, run:
```bash
./scripts/check-customizations.sh
```

---

## Critical Files (Repeatedly Wiped by Upstream Merges)

These files have been overwritten by upstream merges multiple times. **Always verify after merge.**

| File | What We Changed | Why |
|------|----------------|-----|
| `packages/twenty-front/src/modules/object-record/hooks/useBuildRecordInputFromRLSPredicates.ts` | Indirect RLS relation resolution (Agent → WorkspaceMember) | Members can't create policies without it — frontend throws before mutation |
| `packages/twenty-front/src/modules/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectForm.tsx` | Removed Organization plan gate on RLS | Self-hosted, no billing — RLS must always be available |
| `packages/twenty-front/src/modules/navigation/components/MainNavigationDrawer.tsx` | Sidebar: Settings at top, Documentation removed, Search restored | UX preferences |
| `packages/twenty-front/src/locales/*.po` and `src/locales/generated/*.ts` | Custom Lingui translations | Must re-run `lingui extract && lingui compile` after upstream merge |
| `packages/twenty-server/src/engine/metadata-modules/role/role.entity.ts` | Added `editWindowMinutes` column | Configurable edit window per role |
| `packages/twenty-server/src/engine/metadata-modules/object-permission/object-permission.entity.ts` | Added `editWindowMinutes` column | Per-object edit window override |
| `packages/twenty-server/src/engine/metadata-modules/role/services/workspace-roles-permissions-cache.service.ts` | Resolves `editWindowMinutes` in cache | Edit window enforcement depends on this |
| `packages/twenty-shared/src/types/ObjectPermissions.ts` | Added `editWindowMinutes` to shared type | Both server + frontend depend on this |

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
- `utils/get-today-for-member.util.ts` — Timezone-aware date helper
- `utils/lookup-carrier-product-commission.util.ts` — LTV lookup from CarrierProduct

### `packages/twenty-server/src/modules/call/`
- `query-hooks/call-create-one.pre-query.hook.ts` — Auto-assigns agentId on call create
- `query-hooks/call-create-many.pre-query.hook.ts` — Same for bulk
- `query-hooks/call-create-one.post-query.hook.ts` — Post-create enrichment
- `query-hooks/call-create-many.post-query.hook.ts` — Same for bulk
- `query-hooks/call-query-hook.module.ts` — Module registration

### `packages/twenty-server/src/modules/lead/`
- `query-hooks/lead-create-one.pre-query.hook.ts` — Lead pre-processing
- `query-hooks/lead-create-many.pre-query.hook.ts` — Same for bulk
- `query-hooks/person-create-one.pre-query.hook.ts` — Person/Lead creation hooks
- `query-hooks/person-create-many.pre-query.hook.ts` — Same for bulk
- `query-hooks/lead-query-hook.module.ts` — Module registration

## Modified Upstream Frontend Files

### Spreadsheet Import (CSV Import/Export)
| File | Modification |
|------|-------------|
| `spreadsheet-import/types/SpreadsheetImportField.ts` | Added `isRelationUpdateField` and `targetFieldMetadataItem` properties |
| `object-record/spreadsheet-import/hooks/useBuildSpreadSheetImportFields.ts` | Added relation update fields to import dropdown |
| `object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog.ts` | Execute relation updates after parent upsert |
| `object-record/spreadsheet-import/utils/buildRecordFromImportedStructuredRow.ts` | Explicit `isRelationConnectField` filter |
| `object-record/object-options-dropdown/hooks/useExportProcessRecordsForCSV.ts` | Keep composite fields as objects for proper sub-field export |
| `object-record/record-index/export/hooks/useRecordIndexExportRecords.ts` | Split composite relation sub-fields into separate CSV columns |
| `spreadsheet-import/utils/dataMutations.ts` | Trim whitespace before validation |
| `spreadsheet-import/utils/normalizeTableData.ts` | Trim whitespace on matched column values |

### New Spreadsheet Import Utilities
| File | Purpose |
|------|---------|
| `object-record/spreadsheet-import/utils/executeRelationUpdatesViaMutation.ts` | Execute batched createMany upserts for relation updates |
| `object-record/spreadsheet-import/utils/extractRelationUpdatesFromImportedRows.ts` | Extract relation update data from imported rows |
| `object-record/spreadsheet-import/utils/spreadsheetImportGetRelationUpdateSubFieldKey.ts` | Key format for update fields |
| `object-record/spreadsheet-import/utils/spreadsheetImportGetRelationUpdateSubFieldLabel.ts` | Label format for update fields |

### RLS and Permissions
| File | Modification |
|------|-------------|
| `object-record/hooks/useBuildRecordInputFromRLSPredicates.ts` | **CRITICAL** — Indirect relation resolution for Agent → WorkspaceMember |
| `settings/roles/.../SettingsRolePermissionsObjectLevelObjectForm.tsx` | Removed Organization plan billing gate |

### Relation Picker Filtering (Policy Assignment)
| File | Modification |
|------|-------------|
| `record-field-list/.../RecordDetailRelationSectionDropdownToOne.tsx` | Junction bridge filter fix + resolves dependency filter to id-based via `useFindManyRecords` (search API can't filter by object-specific fields like `carrierId`) |
| `record-field-list/.../RecordDetailRelationSectionDropdownToMany.tsx` | Excludes policies already assigned to other leads from the policy picker on lead detail sidebar |
| `record-picker/single-record-picker/components/SingleRecordPicker.tsx` | Passes `additionalFilter` through to `SingleRecordPickerMenuItemsWithSearch` (was silently dropped) |
| `record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch.ts` | Added `forceExcludedRecordIds` param + persists excluded IDs in atom for subsequent searches |
| `record-picker/multiple-record-picker/states/multipleRecordPickerExcludedRecordIdsComponentState.ts` | **NEW** — Atom for persisting excluded record IDs across picker searches |
| `record-field/ui/meta-types/input/components/RelationOneToManyFieldInput.tsx` | Fetches policies assigned to other leads and triggers initial search with exclusions (table cell inline edit) |
| `record-field/ui/meta-types/input/hooks/useOpenRelationFromManyFieldInput.tsx` | Removed `performSearch` — initial search moved to `RelationOneToManyFieldInput` so excluded IDs are applied before results show |
| `record-field/ui/hooks/useOpenFieldInputEditMode.ts` | Removed unused `excludedRecordIds` param |

### Other Frontend

## Modified Upstream Server Files

### RLS / Permissions Engine
| File | Modification |
|------|-------------|
| `engine/twenty-orm/utils/build-row-level-permission-record-filter.util.ts` | Indirect relation support, deny-by-default when predicates can't resolve |
| `engine/twenty-orm/utils/validate-rls-predicates-for-records.util.ts` | RLS validation on record create/update |
| `engine/api/common/common-select-fields/utils/filter-restricted-fields-from-select.util.ts` | **NEW** — Strip restricted fields instead of rejecting queries |

### Configurable Edit Window (Per-Role, Per-Object)
| File | Modification |
|------|-------------|
| `engine/metadata-modules/role/role.entity.ts` | Added `editWindowMinutes` column (nullable integer) — global default per role |
| `engine/metadata-modules/object-permission/object-permission.entity.ts` | Added `editWindowMinutes` column (nullable integer) — per-object override |
| `engine/metadata-modules/role/dtos/role.dto.ts` | Added `editWindowMinutes` GraphQL field |
| `engine/metadata-modules/role/dtos/update-role.input.ts` | Added `editWindowMinutes` input field |
| `engine/metadata-modules/role/dtos/create-role.input.ts` | Added `editWindowMinutes` input field |
| `engine/metadata-modules/object-permission/dtos/object-permission.dto.ts` | Added `editWindowMinutes` GraphQL field |
| `engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input.ts` | Added `editWindowMinutes` input field |
| `engine/metadata-modules/role/services/workspace-roles-permissions-cache.service.ts` | Resolves `editWindowMinutes`: object override → role default → null (no restriction) |
| `engine/metadata-modules/role/utils/fromRoleEntityToRoleDto.util.ts` | Maps `editWindowMinutes` to DTO |
| `engine/metadata-modules/flat-role/utils/from-create-role-input-to-flat-role-to-create.util.ts` | Includes `editWindowMinutes` in role creation |
| `engine/metadata-modules/flat-role/utils/from-role-entity-to-flat-role.util.ts` | Includes `editWindowMinutes` in flat role |
| `engine/core-modules/application/utils/from-role-manifest-to-universal-flat-role.util.ts` | Defaults `editWindowMinutes: null` |
| `engine/workspace-manager/.../create-standard-role-flat-metadata.util.ts` | Defaults `editWindowMinutes: null` for standard roles |
| `engine/twenty-orm/utils/compute-permission-intersection.util.ts` | Includes `editWindowMinutes: null` in permission intersection |
| `database/typeorm/core/migrations/common/1772591146793-add-edit-window-minutes.ts` | **NEW** migration adding column to `role` and `objectPermission` tables |

**Frontend — Edit Window UI:**
| File | Modification |
|------|-------------|
| `settings/roles/.../SettingsRolePermissionsObjectLevelEditWindowRow.tsx` | **NEW** — Duration selector row (No limit, 5min–7 days) in object permissions form |
| `settings/roles/.../SettingsRolePermissionsObjectLevelObjectFormObjectLevel.tsx` | Added `EditWindowRow` below existing permission checkboxes |
| `settings/roles/graphql/fragments/roleFragment.ts` | Added `editWindowMinutes` to query |
| `settings/roles/graphql/fragments/objectPermissionFragment.ts` | Added `editWindowMinutes` to query |
| `settings/roles/role/hooks/useSaveDraftRoleToDB.ts` | Includes `editWindowMinutes` in create/update role + object permission upsert payloads |

**Shared types:**
| File | Modification |
|------|-------------|
| `packages/twenty-shared/src/types/ObjectPermissions.ts` | Added `editWindowMinutes: number \| null` |

### Standard Object Index (Unique Constraints)
| File | Modification |
|------|-------------|
| `engine/workspace-manager/.../compute-person-standard-flat-index-metadata.util.ts` | Phone is unique (not email) |

## Post-Merge Checklist

After every upstream merge:

1. **Run the check script**: `./scripts/check-customizations.sh`
2. **Re-extract Lingui**: `npx nx run twenty-front:lingui:extract && npx nx run twenty-front:lingui:compile`
3. **Verify RLS works**: Log in as member role, create a policy from Policies page
4. **Verify sidebar**: Settings at top, no Documentation link, Search in sidebar
5. **Verify RLS settings UI**: No "Upgrade to access" gate on Record-level permissions
6. **Verify edit window**: Settings → Roles → Member → Permissions → Policy → "Edit window" dropdown present, saves correctly
7. **Run lint + typecheck**: `npx nx lint:diff-with-main twenty-front && npx nx typecheck twenty-front`
8. **Flush Redis after deploy**: `cache:flat-cache-invalidate --all-metadata`
