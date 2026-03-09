import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsFamilySelector';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useStore } from 'jotai';
import { useContext } from 'react';
import {
  CoreObjectNameSingular,
  type CommandMenuContextApi,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useCommandMenuContextApi = (): CommandMenuContextApi => {
  const store = useStore();

  const { isInSidePanel } = useContext(CommandMenuContext);

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === contextStoreCurrentObjectMetadataItemId,
  );

  const { sortedFavorites: favorites } = useFavorites();
  const { navigationMenuItems } = usePrefetchedNavigationMenuItemsData();

  const recordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const isFavorite = (() => {
    if (!isDefined(recordId)) return false;

    if (isNavigationMenuItemEditingEnabled && isDefined(objectMetadataItem)) {
      return !!navigationMenuItems?.find(
        (item) =>
          item.targetRecordId === recordId &&
          item.targetObjectMetadataId === objectMetadataItem.id,
      );
    }

    return !!favorites?.find((favorite) => favorite.recordId === recordId);
  })();

  const selectedRecord =
    useAtomFamilyStateValue(recordStoreFamilyState, recordId ?? '') ||
    undefined;

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

  const isNoteOrTask =
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Note ||
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Task;

  const isRemote = objectMetadataItem?.isRemote ?? false;

  const { recordIndexId } = useRecordIndexIdFromCurrentContextStore();

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
    recordIndexId,
  );

  const isShowPage =
    useAtomComponentStateValue(contextStoreCurrentViewTypeComponentState) ===
    ContextStoreViewType.ShowPage;

  const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

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

  return {
    isShowPage,
    isInSidePanel,
    isFavorite,
    isRemote,
    isNoteOrTask,
    isSelectAll,
    hasAnySoftDeleteFilterOnView,
    numberOfSelectedRecords: contextStoreNumberOfSelectedRecords,
    objectPermissions,
    selectedRecord: selectedRecord as CommandMenuContextApi['selectedRecord'],
    featureFlags,
    targetObjectReadPermissions,
    targetObjectWritePermissions,
  };
};
