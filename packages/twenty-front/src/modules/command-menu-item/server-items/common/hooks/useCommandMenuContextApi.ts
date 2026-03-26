import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsFamilySelector';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyArray } from '@sniptt/guards';
import { useAtomValue, useStore } from 'jotai';
import {
  CommandMenuContextApiPageType,
  SidePanelPages,
  type CommandMenuContextApi,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Display-only hook. For the edit page, use useCommandMenuContextApiForEdition.
export const useCommandMenuContextApi = ({
  isInSidePanel,
}: {
  isInSidePanel: boolean;
}): CommandMenuContextApi => {
  const store = useStore();

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const mainContextStoreTargetedRecordsRule = useAtomValue(
    contextStoreTargetedRecordsRuleComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
  );

  const mainContextStoreNumberOfSelectedRecords = useAtomValue(
    contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
  );

  const mainContextStoreCurrentObjectMetadataItemId = useAtomValue(
    contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const sidePanelPage = useAtomStateValue(sidePanelPageState);

  const shouldUseMainContext =
    isInSidePanel &&
    (sidePanelPage === SidePanelPages.CommandMenuDisplay ||
      sidePanelPage === SidePanelPages.CommandMenuEdit);

  const effectiveObjectMetadataItemId = shouldUseMainContext
    ? mainContextStoreCurrentObjectMetadataItemId
    : contextStoreCurrentObjectMetadataItemId;

  const effectiveTargetedRecordsRule = shouldUseMainContext
    ? mainContextStoreTargetedRecordsRule
    : contextStoreTargetedRecordsRule;

  const effectiveNumberOfSelectedRecords = shouldUseMainContext
    ? mainContextStoreNumberOfSelectedRecords
    : contextStoreNumberOfSelectedRecords;

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === effectiveObjectMetadataItemId,
  );

  const { navigationMenuItems } = useNavigationMenuItemsData();

  const recordIds =
    effectiveTargetedRecordsRule.mode === 'selection'
      ? effectiveTargetedRecordsRule.selectedRecordIds
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

  const { recordIndexId } = useRecordIndexIdFromCurrentContextStore();

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
    recordIndexId,
  );

  const contextStoreCurrentViewType = useAtomComponentStateValue(
    contextStoreCurrentViewTypeComponentState,
  );

  const contextStoreIsPageInEditMode = useAtomComponentStateValue(
    contextStoreIsPageInEditModeComponentState,
  );

  const pageType =
    contextStoreCurrentViewType === ContextStoreViewType.ShowPage
      ? CommandMenuContextApiPageType.RECORD_PAGE
      : CommandMenuContextApiPageType.INDEX_PAGE;

  const isSelectAll = effectiveTargetedRecordsRule.mode === 'exclusion';

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

  return {
    pageType,
    isInSidePanel,
    isPageInEditMode: contextStoreIsPageInEditMode,
    favoriteRecordIds,
    isSelectAll,
    hasAnySoftDeleteFilterOnView,
    numberOfSelectedRecords: effectiveNumberOfSelectedRecords,
    objectPermissions,
    selectedRecords,
    featureFlags,
    targetObjectReadPermissions,
    targetObjectWritePermissions,
    objectMetadataItem: objectMetadataItem ?? {},
  };
};
