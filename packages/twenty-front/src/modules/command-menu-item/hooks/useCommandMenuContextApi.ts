import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsFamilySelector';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyArray } from '@sniptt/guards';
import { useStore } from 'jotai';
import {
  ContextStorePageType,
  type CommandMenuContextApi,
} from 'twenty-shared/types';
import { isDefined, resolveObjectMetadataLabel } from 'twenty-shared/utils';

export const useCommandMenuContextApi = (): CommandMenuContextApi => {
  const store = useStore();

  const contextStoreInstanceId = useAvailableComponentInstanceIdOrThrow(
    ContextStoreComponentInstanceContext,
  );
  const isInSidePanel =
    contextStoreInstanceId === SIDE_PANEL_COMPONENT_INSTANCE_ID;

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

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem?.namePlural ?? '',
    contextStoreCurrentViewId ?? '',
  );

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
    recordIndexId,
  );

  const contextStoreCurrentPageType = useAtomComponentStateValue(
    contextStoreCurrentPageTypeComponentState,
  );

  const contextStoreIsPageInEditMode = useAtomComponentStateValue(
    contextStoreIsPageInEditModeComponentState,
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
    isPageInEditMode: contextStoreIsPageInEditMode,
    favoriteRecordIds,
    isSelectAll,
    hasAnySoftDeleteFilterOnView,
    numberOfSelectedRecords: contextStoreNumberOfSelectedRecords,
    objectPermissions,
    selectedRecords,
    featureFlags,
    targetObjectReadPermissions,
    targetObjectWritePermissions,
    objectMetadataItem: objectMetadataItem ?? {},
    objectMetadataLabel,
  };
};
