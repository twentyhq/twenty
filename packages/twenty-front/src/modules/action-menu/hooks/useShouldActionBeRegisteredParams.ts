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
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback, useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useShouldActionBeRegisteredParams = ({
  objectMetadataItem,
}: {
  objectMetadataItem?: ObjectMetadataItem;
}): ShouldBeRegisteredFunctionParams => {
  const { sortedFavorites: favorites } = useFavorites();
  const { navigationMenuItems } = usePrefetchedNavigationMenuItemsData();
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
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
    useFamilyRecoilValueV2(recordStoreFamilyState, recordId ?? '') || undefined;

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem?.id ?? '',
  );

  const isNoteOrTask =
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Note ||
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Task;

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const { recordIndexId } = useRecordIndexIdFromCurrentContextStore();

  const hasAnySoftDeleteFilterOnView = useRecoilComponentSelectorValueV2(
    hasAnySoftDeleteFilterOnViewComponentSelector,
    recordIndexId,
  );

  const isShowPage =
    useRecoilComponentValueV2(
      contextStoreCurrentViewTypeComponentState,
      MAIN_CONTEXT_STORE_INSTANCE_ID,
    ) === ContextStoreViewType.ShowPage;

  const numberOfSelectedRecords = useRecoilComponentValueV2(
    contextStoreNumberOfSelectedRecordsComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const contextStoreCurrentViewType = useRecoilComponentValueV2(
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
      return jotaiStore.get(
        objectPermissionsFamilySelector.selectorFamily({
          objectNameSingular: objectMetadataNameSingular,
        }),
      ).canRead;
    },
    [],
  );

  const getObjectWritePermission = useCallback(
    (objectMetadataNameSingular: string) => {
      return jotaiStore.get(
        objectPermissionsFamilySelector.selectorFamily({
          objectNameSingular: objectMetadataNameSingular,
        }),
      ).canUpdate;
    },
    [],
  );

  const forceRegisteredActionsByKey = useRecoilValueV2(
    forceRegisteredActionsByKeyState,
  );

  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

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
