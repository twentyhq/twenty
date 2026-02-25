import { forceRegisteredActionsByKeyState } from '@/action-menu/actions/states/forceRegisteredActionsMapComponentState';
import { type ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { getActionViewType } from '@/action-menu/actions/utils/getActionViewType';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsFamilySelector';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback, useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useStore } from 'jotai';

export const useShouldActionBeRegisteredParams = ({
  objectMetadataItem,
}: {
  objectMetadataItem?: ObjectMetadataItem;
}): ShouldBeRegisteredFunctionParams => {
  const store = useStore();
  const { sortedFavorites: favorites } = useFavorites();
  const { navigationMenuItems } = usePrefetchedNavigationMenuItemsData();
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const recordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const isFavorite = useMemo(() => {
    if (!isDefined(recordId)) {
      return false;
    }

    if (isNavigationMenuItemEditingEnabled && isDefined(objectMetadataItem)) {
      const foundNavigationMenuItem = navigationMenuItems?.find(
        (item) =>
          item.targetRecordId === recordId &&
          item.targetObjectMetadataId === objectMetadataItem.id,
      );
      return !!foundNavigationMenuItem;
    }

    const foundFavorite = favorites?.find(
      (favorite) => favorite.recordId === recordId,
    );
    return !!foundFavorite;
  }, [
    recordId,
    isNavigationMenuItemEditingEnabled,
    objectMetadataItem,
    navigationMenuItems,
    favorites,
  ]);

  const selectedRecord =
    useAtomFamilyStateValue(recordStoreFamilyState, recordId ?? '') ||
    undefined;

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem?.id ?? '',
  );

  const isNoteOrTask =
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Note ||
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Task;

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const { recordIndexId } = useRecordIndexIdFromCurrentContextStore();

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
    recordIndexId,
  );

  const isShowPage =
    useAtomComponentStateValue(
      contextStoreCurrentViewTypeComponentState,
      MAIN_CONTEXT_STORE_INSTANCE_ID,
    ) === ContextStoreViewType.ShowPage;

  const numberOfSelectedRecords = useAtomComponentStateValue(
    contextStoreNumberOfSelectedRecordsComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const contextStoreCurrentViewType = useAtomComponentStateValue(
    contextStoreCurrentViewTypeComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const viewType = getActionViewType(
    contextStoreCurrentViewType,
    contextStoreTargetedRecordsRule,
  );

  const isSelectAll = contextStoreTargetedRecordsRule.mode === 'exclusion';

  const getObjectReadPermission = useCallback(
    (objectMetadataNameSingular: string) => {
      return store.get(
        objectPermissionsFamilySelector.selectorFamily({
          objectNameSingular: objectMetadataNameSingular,
        }),
      ).canRead;
    },
    [store],
  );

  const getObjectWritePermission = useCallback(
    (objectMetadataNameSingular: string) => {
      return store.get(
        objectPermissionsFamilySelector.selectorFamily({
          objectNameSingular: objectMetadataNameSingular,
        }),
      ).canUpdate;
    },
    [store],
  );

  const forceRegisteredActionsByKey = useAtomStateValue(
    forceRegisteredActionsByKeyState,
  );

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isFeatureFlagEnabled = (featureFlagKey: FeatureFlagKey) => {
    const featureFlag = currentWorkspace?.featureFlags?.find(
      (flag) => flag.key === featureFlagKey,
    );

    return featureFlag?.value === true;
  };

  return {
    objectMetadataItem,
    isFavorite,
    objectPermissions,
    isNoteOrTask,
    isInRightDrawer,
    hasAnySoftDeleteFilterOnView,
    isShowPage,
    isSelectAll,
    selectedRecord,
    numberOfSelectedRecords,
    viewType: viewType ?? undefined,
    getTargetObjectReadPermission: getObjectReadPermission,
    getTargetObjectWritePermission: getObjectWritePermission,
    forceRegisteredActionsByKey,
    isFeatureFlagEnabled,
  };
};
