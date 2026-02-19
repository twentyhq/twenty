# Recoil → Jotai Migration Plan

## Overview

- **429 state files** + **69 selector files** = ~500 total Recoil-based state definitions
- **5 already migrated** (dropdown component states)
- Organized into **14 PRs** by module area, starting from lowest-level (fewest dependencies) to highest-level

## State Creation Patterns (Recoil → Jotai)

| Recoil Pattern | Count | Jotai Equivalent |
|---|---|---|
| `createState()` | ~100 global states | `createStateV2()` → Jotai `atom()` |
| `createComponentState()` | ~200 component states | `createComponentStateV2()` → Jotai `atom()` with instance cache |
| `createComponentFamilyState()` | ~27 component family states | New `createComponentFamilyStateV2()` → Jotai `atom()` with two-level cache |
| `createComponentSelector()` | ~28 component selectors | New `createComponentSelectorV2()` → Jotai derived `atom()` |
| `createComponentFamilySelector()` | ~9 component family selectors | New `createComponentFamilySelectorV2()` |
| Raw `atom()` from recoil | 3 | Jotai `atom()` via `createStateV2()` |
| Raw `atomFamily()` from recoil | 3 | Jotai `atom()` via `createFamilyStateV2()` |
| Raw `selector()` from recoil | 11 | Jotai derived `atom()` via `createSelectorV2()` |
| Raw `selectorFamily()` from recoil | ~21 | Jotai derived `atom()` via family pattern |

## Hook Migration

| Recoil Hook | Jotai Equivalent |
|---|---|
| `useRecoilValue()` | `useRecoilValueV2()` (already exists, wraps `useAtomValue`) |
| `useRecoilState()` | `useRecoilStateV2()` (already exists, wraps `useAtom`) |
| `useSetRecoilState()` | `useSetRecoilStateV2()` (already exists, wraps `useSetAtom`) |
| `useResetRecoilState()` | `jotaiStore.set(atom, defaultValue)` or new `useResetAtom` wrapper |
| `useRecoilComponentValue()` | `useRecoilComponentValueV2()` (already exists) |
| `useSetRecoilComponentState()` | `useSetRecoilComponentStateV2()` (already exists) |
| `useRecoilComponentState()` | `useRecoilComponentStateV2()` (already exists) |
| `useRecoilCallback()` | `useCallback()` + `jotaiStore.get/set` |

## Infrastructure Needed Before Migration

Before starting the PRs below, these Jotai V2 utilities need to be created (if not already):

- [x] `createStateV2()` — global atom
- [x] `createFamilyStateV2()` — global atom family
- [x] `createSelectorV2()` — global derived atom
- [x] `createComponentStateV2()` — instance-scoped atom
- [ ] `createComponentFamilyStateV2()` — instance-scoped atom family
- [ ] `createComponentSelectorV2()` — instance-scoped derived atom
- [ ] `createComponentFamilySelectorV2()` — instance-scoped derived atom family
- [ ] `createFamilySelectorV2()` — global derived atom family (for raw selectorFamily replacements)

---

## PR 1: UI Utilities — Focus, Hotkeys, Loading, Pointer Events, Scroll

Low-level utilities used across the entire app. No dependencies on other app states.

### States (16 files)
```
ui/utilities/focus/states/focusStackState.ts
ui/utilities/hotkey/states/internal/pendingHotkeysState.ts
ui/utilities/loading-state/states/currentPageLocationState.ts
ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState.ts
ui/utilities/pointer-event/states/clickOutsideListenerIsMouseDownInsideComponentState.ts
ui/utilities/pointer-event/states/clickOutsideListenerMouseDownHappenedComponentState.ts
ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState.ts
ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState.ts
ui/utilities/scroll/states/scrollWrapperScrollTopComponentState.ts
```

### Selectors (3 files)
```
ui/utilities/focus/states/currentFocusIdSelector.ts
ui/utilities/focus/states/currentFocusedItemSelector.ts
ui/utilities/focus/states/currentGlobalHotkeysConfigSelector.ts
```

### Notes
- `focusStackState` is used by the dropdown hooks — needs to be migrated to unblock removing `useRecoilCallback` from dropdown hooks
- Focus selectors depend on `focusStackState`

---

## PR 2: UI Layout — Selectable List, Modal, Tab List, Table

Core layout primitives used by record-table, record-board, and many other modules.

### States (7 files)
```
ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState.ts
ui/layout/selectable-list/states/selectableItemIdsComponentState.ts
ui/layout/selectable-list/states/selectedItemIdComponentState.ts
ui/layout/modal/states/isModalOpenedComponentState.ts
ui/layout/tab-list/states/activeTabIdComponentState.ts
ui/layout/table/states/sortedFieldByTableFamilyState.ts
```

### Selectors (1 file)
```
ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector.ts
```

---

## PR 3: UI Navigation, Theme, Input, Feedback, Field

### States (12 files)
```
ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState.ts
ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState.ts
ui/navigation/states/isNavigationDrawerExpanded.ts (raw Recoil atom)
ui/navigation/states/navigationDrawerWidthState.ts
ui/navigation/states/navigationMemorizedUrlState.ts
ui/navigation/states/shouldNavigateBackToMemorizedUrlOnSaveState.ts
ui/navigation/step-bar/states/stepBarInternalState.ts
ui/theme/states/persistedColorSchemeState.ts
ui/input/states/iconPickerState.ts
ui/input/states/iconPickerVisibleCountState.ts
ui/feedback/dialog-manager/states/dialogInternalComponentState.ts
ui/feedback/snack-bar-manager/states/snackBarInternalComponentState.ts
ui/field/display/states/filePreviewState.ts
```

---

## PR 4: Auth, Domain Manager, App, Captcha, Chrome Extension

Core authentication and app-level states. Very widely imported (~195 external imports for auth).

### States (25 files)
```
auth/states/availableWorkspacesState.ts
auth/states/billingCheckoutSessionState.ts
auth/states/currentUserState.ts
auth/states/currentUserWorkspaceState.ts
auth/states/currentWorkspaceDeletedMembersState.ts
auth/states/currentWorkspaceMemberState.ts
auth/states/currentWorkspaceMembersState.ts
auth/states/currentWorkspaceState.ts
auth/states/isCurrentUserLoadedState.ts
auth/states/lastAuthenticatedMethodState.ts
auth/states/loginTokenState.ts
auth/states/previousUrlState.ts
auth/states/signInUpModeState.ts
auth/states/signInUpStepState.ts
auth/states/tokenPairState.ts
auth/states/workspacePublicDataState.ts
domain-manager/states/domainConfigurationState.ts
domain-manager/states/lastAuthenticatedWorkspaceDomainState.ts
app/states/isAppEffectRedirectEnabledState.ts
app/states/verifyEmailRedirectPathState.ts
captcha/states/captchaTokenState.ts
captcha/states/isCaptchaScriptLoadedState.ts
captcha/states/isRequestingCaptchaTokenState.ts
chrome-extension-sidecar/states/isLoadingTokensFromExtensionState.ts
workspace/states/workspaceAuthBypassProvidersState.ts
workspace/states/workspaceAuthProvidersState.ts
workspace/states/workspaceBypassModeState.ts
```

### Selectors (2 files)
```
auth/states/isImpersonatingState.ts (raw Recoil selector)
auth/states/objectPermissionsFamilySelector.ts
```

---

## PR 5: Client Config

26 simple global states, mostly boolean feature flags. Low risk.

### States (26 files)
```
client-config/states/aiModelsState.ts
client-config/states/apiConfigState.ts
client-config/states/appVersionState.ts
client-config/states/authProvidersState.ts
client-config/states/billingState.ts
client-config/states/calendarBookingPageIdState.ts
client-config/states/canManageFeatureFlagsState.ts
client-config/states/captchaState.ts
client-config/states/chromeExtensionIdState.ts
client-config/states/clientConfigApiStatusState.ts
client-config/states/isAnalyticsEnabledState.ts
client-config/states/isAttachmentPreviewEnabledState.ts
client-config/states/isClickHouseConfiguredState.ts
client-config/states/isCloudflareIntegrationEnabledState.ts
client-config/states/isConfigVariablesInDbEnabledState.ts
client-config/states/isDeveloperDefaultSignInPrefilledState.ts
client-config/states/isEmailVerificationRequiredState.ts
client-config/states/isEmailingDomainsEnabledState.ts
client-config/states/isGoogleCalendarEnabledState.ts
client-config/states/isGoogleMessagingEnabledState.ts
client-config/states/isImapSmtpCaldavEnabledState.ts
client-config/states/isMicrosoftCalendarEnabledState.ts
client-config/states/isMicrosoftMessagingEnabledState.ts
client-config/states/isMultiWorkspaceEnabledState.ts
client-config/states/sentryConfigState.ts
client-config/states/supportChatState.ts
```

---

## PR 6: Object Metadata

Core metadata states used by record-table, record-board, views, etc.

### States (3 files)
```
object-metadata/states/lastFieldMetadataItemUpdateState.ts
object-metadata/states/objectMetadataItemsState.ts
object-metadata/states/shouldAppBeLoadingState.ts
```

### Selectors (12 files)
```
object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector.ts
object-metadata/states/availableFieldMetadataItemsForSortFamilySelector.ts
object-metadata/states/fieldMetadataItemByIdSelector.ts
object-metadata/states/flattenedFieldMetadataItemsSelector.ts
object-metadata/states/flattenedReadableFieldMetadataItemIdsSelector.ts
object-metadata/states/isFieldMetadataItemFilterableAndSortableSelector.ts
object-metadata/states/isFieldMetadataItemLabelIdentifierSelector.ts
object-metadata/states/labelIdentifierFieldMetadataItemSelector.ts
object-metadata/states/objectMetadataItemFamilySelector.ts
object-metadata/states/objectMetadataItemsByNamePluralMapSelector.ts
object-metadata/states/objectMetadataItemsByNameSingularMapSelector.ts
object-metadata/states/objectMetadataItemsBySingularNameSelector.ts
```

### Notes
- Object metadata selectors are raw `selectorFamily()` from Recoil — needs `createFamilySelectorV2()` utility
- Very widely depended on (~135 external imports)

---

## PR 7: Object Record — Record Store

The central record store, depended on by almost everything (~190 external imports).

### States (2 files)
```
object-record/states/recordStoreFamilyState.ts (raw atomFamily)
object-record/record-store/states/recordStoreFamilyState.ts
```

### Selectors (6 files)
```
object-record/record-store/states/selectors/recordStoreFamilySelector.ts
object-record/record-store/states/selectors/recordStoreFieldValueSelector.ts
object-record/record-store/states/selectors/recordStoreIdentifierSelector.ts
object-record/record-store/states/selectors/recordStoreIdentifiersSelector.ts
object-record/record-store/states/selectors/recordStoreMorphOneToManyValueWithObjectNameFamilySelector.ts
object-record/record-store/states/selectors/recordStoreRecordsSelector.ts
```

---

## PR 8: Object Record — Filters, Sorts, Groups, Drag, Field, Calendar, Board, Picker

### States (~80 files)
```
object-record/object-filter-dropdown/states/ (12 files)
object-record/object-sort-dropdown/states/ (3 files)
object-record/record-filter/states/ (2 files)
object-record/record-filter-group/states/ (1 file)
object-record/record-sort/states/ (1 file)
object-record/record-group/states/ (3 files)
object-record/record-drag/states/ (7 files)
object-record/record-field/states/ (7 files)
object-record/record-field-list/states/ (2 files)
object-record/record-calendar/states/ (6 files)
object-record/record-board/states/ (18 files)
object-record/record-picker/states/ (15 files)
object-record/record-right-drawer/states/ (2 files)
object-record/record-merge/states/ (2 files)
object-record/record-title-cell/states/ (1 file)
object-record/advanced-filter/states/ (1 selector)
```

### Selectors (~20 files)
```
object-record/record-group/states/selectors/ (6 files)
object-record/record-index/states/selectors/ (5 files)
object-record/record-board/states/selectors/ (2 files)
object-record/record-calendar/states/selectors/ (2 files)
object-record/record-picker/states/selectors/ (5 files)
object-record/record-field/states/ (1 selector)
object-record/object-filter-dropdown/states/ (1 selector)
```

---

## PR 9: Object Record — Record Table

Largest single module (40 states + 10 selectors).

### States (~40 files)
```
object-record/record-table/states/ (all component states)
object-record/record-table/record-table-row/states/
object-record/record-table/record-table-footer/states/
object-record/record-table/record-table-section/states/
object-record/record-table/virtualization/states/
```

### Selectors (~10 files)
```
object-record/record-table/states/selectors/
object-record/record-table/record-table-row/states/
object-record/record-table/virtualization/states/
```

---

## PR 10: Object Record — Record Index

### States (~17 files)
```
object-record/record-index/states/ (all files)
```

### Selectors (~5 files)
```
object-record/record-index/states/selectors/ (all files)
```

---

## PR 11: Views, Favorites, Navigation, Prefetch, Localization

### States (~30 files)
```
views/states/ (10 files)
views/view-picker/states/ (13 files)
favorites/favorite-folder-picker/states/ (4 files)
navigation/states/ (3 files)
prefetch/states/ (4 files)
localization/states/ (1 file)
information-banner/states/ (1 file)
```

### Selectors (~8 files)
```
views/states/selectors/ (6 files)
favorites/states/selectors/ (1 file)
favorites/favorite-folder-picker/states/selectors/ (1 file)
```

---

## PR 12: Context Store, Command Menu, Action Menu

### States (~22 files)
```
context-store/states/ (10 files)
command-menu/states/ (10 files)
command-menu/pages/*/states/ (10 files)
action-menu/states/ (1 file)
action-menu/actions/states/ (1 file)
```

---

## PR 13: Workflow, Page Layout, AI, Activities

### States (~45 files)
```
workflow/states/ (6 files)
workflow/workflow-diagram/states/ (12 files)
workflow/workflow-steps/states/ (7 files)
workflow/workflow-variables/states/ (2 files)
page-layout/states/ (17 files)
page-layout/widgets/states/ (10 files)
ai/states/ (2 files)
activities/states/ (5 files)
blocknote-editor/states/ (1 file)
```

### Selectors (~3 files)
```
workflow/states/selectors/ (2 files)
workflow/workflow-steps/filters/states/ (1 selector)
page-layout/states/selectors/ (1 file)
```

---

## PR 14: Settings, SSE, Spreadsheet Import, Misc

Leaf modules with few external consumers.

### States (~30 files)
```
settings/admin-panel/ (4 files)
settings/data-model/ (2 files)
settings/developers/ (1 file)
settings/domains/ (3 files)
settings/logic-functions/ (1 file)
settings/playground/ (1 file)
settings/roles/ (4 files)
settings/security/ (2 files)
sse-db-event/states/ (9 files)
spreadsheet-import/states/ (4 files)
```

### Selectors (1 file)
```
settings/roles/states/settingsAllRolesSelector.ts
```

---

## Testing Strategy

Each PR should:
1. Migrate state definitions (swap `createState` → `createStateV2`, etc.)
2. Update all consumer hooks (swap `useRecoilValue` → `useRecoilValueV2`, etc.)
3. Update `useRecoilCallback` → `useCallback` + `jotaiStore.get/set`
4. Run `npx nx typecheck twenty-front`
5. Run `npx nx test twenty-front` for affected test files
6. Verify affected Storybook stories

## Notes

- The `beforeEach: resetJotaiStore()` in `.storybook/preview.tsx` handles Storybook isolation globally
- Unit tests need `JotaiProvider store={jotaiStore}` in their wrappers and `beforeEach` resets for affected atoms
- Some states use `effects` (e.g., `cookieStorageEffect`, `localStorageEffect`) — these need Jotai `onMount` equivalents
- States with `useResetRecoilState` need a wrapper or direct `jotaiStore.set(atom, defaultValue)`
