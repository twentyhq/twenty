import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsFamilySelector';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { useContextStoreInstanceId } from '@/context-store/hooks/useContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyArray } from '@sniptt/guards';
import { useAtomValue, useStore } from 'jotai';
import {
  ContextStorePageType,
  type CommandMenuContextApi,
} from 'twenty-shared/types';
import { isDefined, resolveObjectMetadataLabel } from 'twenty-shared/utils';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useCurrentCommandMenuContextApi = (): CommandMenuContextApi => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();

  const workspaceSurface = useWorkspaceSurface();
  const isInSidePanel = workspaceSurface.type === 'side-panel';
  const contextStoreInstanceId = useContextStoreInstanceId();

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === contextStoreCurrentObjectMetadataItemId,
  );

  const { navigationMenuItems } = useNavigationMenuItemsData();

  const recordIds =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds
      : undefined;

  const favoriteRecordIds =
    !isNonEmptyArray(recordIds) || !isDefined(objectMetadataItem)
      ? []
      : recordIds.filter((recordId) =>
          navigationMenuItems?.some(
            (item) =>
              item.targetRecordId === recordId &&
              item.targetObjectMetadataId === objectMetadataItem.id,
          ),
        );

  const selectedRecords = useAtomFamilySelectorValue(
    recordStoreRecordsSelector,
    { recordIds: recordIds ?? [] },
  );

  const currentPageLayoutId = useAtomStateValue(currentPageLayoutIdState);

  const dashboardPageLayoutIdForCommandMenu =
    selectedRecords[0]?.pageLayoutId ?? currentPageLayoutId ?? '';

  const objectPermissionsFromHook = useObjectPermissionsForObject(
    objectMetadataItem?.id ?? '',
  );
  const objectPermissions = isDefined(objectMetadataItem)
    ? objectPermissionsFromHook
    : {
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
        objectMetadataId: '',
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      };

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const baseRecordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem?.namePlural ?? '',
    contextStoreCurrentViewId ?? '',
  );
  const recordIndexId =
    isInSidePanel &&
    (workspaceSurface.ownsRouteLocation ||
      contextStoreInstanceId !== MAIN_CONTEXT_STORE_INSTANCE_ID)
      ? `${baseRecordIndexId}-${workspaceSurface.instanceId}`
      : baseRecordIndexId;

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
    recordIndexId,
  );

  const contextStoreCurrentPageType = useAtomComponentStateValue(
    contextStoreCurrentPageTypeComponentState,
  );

  const isDashboardInEditMode = useAtomValue(
    isDashboardInEditModeComponentState.atomFamily({
      instanceId: dashboardPageLayoutIdForCommandMenu,
      surfaceId,
    }),
  );

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const pageType = isDefined(contextStoreCurrentPageType)
    ? contextStoreCurrentPageType
    : ContextStorePageType.Index;

  const isSelectAll = contextStoreTargetedRecordsRule.mode === 'exclusion';

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const featureFlags: Record<string, boolean> = {};

  for (const flag of currentWorkspace?.featureFlags ?? []) {
    featureFlags[flag.key] = flag.value === true;
  }

  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);

  const permissionFlags: Record<string, boolean> = {};

  for (const flag of currentUserWorkspace?.permissionFlags ?? []) {
    permissionFlags[flag] = true;
  }

  const currentUser = useAtomStateValue(currentUserState);
  const canImpersonate = currentUser?.canImpersonate === true;
  const canAccessFullAdminPanel = currentUser?.canAccessFullAdminPanel === true;

  const targetObjectReadPermissions: Record<string, boolean> = {};
  const targetObjectWritePermissions: Record<string, boolean> = {};

  for (const metadataItem of objectMetadataItems) {
    const permissions = store.get(
      objectPermissionsFamilySelector.selectorFamily({
        objectNameSingular: metadataItem.nameSingular,
      }),
    );
    targetObjectReadPermissions[metadataItem.nameSingular] =
      permissions.canRead;
    targetObjectWritePermissions[metadataItem.nameSingular] =
      permissions.canUpdate;
  }

  const objectMetadataLabel = isDefined(objectMetadataItem)
    ? resolveObjectMetadataLabel({
        objectMetadataItem: objectMetadataItem,
        numberOfSelectedRecords: contextStoreNumberOfSelectedRecords,
      })
    : '';

  return {
    pageType,
    isInSidePanel,
    isDashboardPageLayoutInEditMode: isDashboardInEditMode,
    isLayoutCustomizationModeEnabled,
    favoriteRecordIds,
    isSelectAll,
    hasAnySoftDeleteFilterOnView,
    numberOfSelectedRecords: contextStoreNumberOfSelectedRecords,
    objectPermissions,
    selectedRecords,
    featureFlags,
    permissionFlags,
    targetObjectReadPermissions,
    targetObjectWritePermissions,
    canImpersonate,
    canAccessFullAdminPanel,
    objectMetadataItem: objectMetadataItem ?? {},
    objectMetadataLabel,
  };
};
