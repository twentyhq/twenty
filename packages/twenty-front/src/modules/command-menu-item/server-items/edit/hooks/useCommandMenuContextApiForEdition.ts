import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsFamilySelector';
import { commandMenuItemEditNumberOfSelectedRecordsState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditNumberOfSelectedRecordsState';
import { commandMenuItemEditObjectMetadataItemIdState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditObjectMetadataItemIdState';
import { commandMenuItemEditRecordSelectionPreviewModeState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditRecordSelectionPreviewModeState';
import { commandMenuItemEditTargetedRecordsRuleState } from '@/command-menu-item/server-items/edit/states/commandMenuItemEditTargetedRecordsRuleState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyArray } from '@sniptt/guards';
import { useStore } from 'jotai';
import {
  CommandMenuContextApiPageType,
  type CommandMenuContextApi,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuContextApiForEdition = (): CommandMenuContextApi => {
  const store = useStore();

  const { objectMetadataItems } = useObjectMetadataItems();

  const commandMenuItemEditObjectMetadataItemId = useAtomComponentStateValue(
    commandMenuItemEditObjectMetadataItemIdState,
  );

  const commandMenuItemEditTargetedRecordsRule = useAtomComponentStateValue(
    commandMenuItemEditTargetedRecordsRuleState,
  );

  const commandMenuItemEditNumberOfSelectedRecords = useAtomComponentStateValue(
    commandMenuItemEditNumberOfSelectedRecordsState,
  );

  const commandMenuItemEditRecordSelectionPreviewMode =
    useAtomComponentStateValue(
      commandMenuItemEditRecordSelectionPreviewModeState,
    );

  const resolvePreviewState = (): {
    targetedRecordsRule: ContextStoreTargetedRecordsRule;
    numberOfSelectedRecords: number;
  } => {
    if (commandMenuItemEditRecordSelectionPreviewMode === 'none') {
      return {
        targetedRecordsRule: { mode: 'selection', selectedRecordIds: [] },
        numberOfSelectedRecords: 0,
      };
    }

    return {
      targetedRecordsRule: commandMenuItemEditTargetedRecordsRule,
      numberOfSelectedRecords: commandMenuItemEditNumberOfSelectedRecords,
    };
  };

  const { targetedRecordsRule, numberOfSelectedRecords } =
    resolvePreviewState();

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === commandMenuItemEditObjectMetadataItemId,
  );

  const { navigationMenuItems } = useNavigationMenuItemsData();

  const recordIds =
    targetedRecordsRule.mode === 'selection'
      ? targetedRecordsRule.selectedRecordIds
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

  const isSelectAll = targetedRecordsRule.mode === 'exclusion';

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
    isInSidePanel: true,
    isPageInEditMode: contextStoreIsPageInEditMode,
    favoriteRecordIds,
    isSelectAll,
    hasAnySoftDeleteFilterOnView,
    numberOfSelectedRecords,
    objectPermissions,
    selectedRecords,
    featureFlags,
    targetObjectReadPermissions,
    targetObjectWritePermissions,
    objectMetadataItem: objectMetadataItem ?? {},
  };
};
