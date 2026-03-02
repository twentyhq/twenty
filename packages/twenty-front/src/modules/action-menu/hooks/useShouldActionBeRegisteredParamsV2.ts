import { type ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { getActionViewType } from '@/action-menu/actions/utils/getActionViewType';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsFamilySelector';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
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
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useShouldActionBeRegisteredParamsV2 = ({
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
  );

  const recordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const isFavorite = (() => {
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
  })();

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
    useAtomComponentStateValue(contextStoreCurrentViewTypeComponentState) ===
    ContextStoreViewType.ShowPage;

  const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const contextStoreCurrentViewType = useAtomComponentStateValue(
    contextStoreCurrentViewTypeComponentState,
  );

  const viewType = getActionViewType(
    contextStoreCurrentViewType,
    contextStoreTargetedRecordsRule,
  );

  const isSelectAll = contextStoreTargetedRecordsRule.mode === 'exclusion';

  const { objectMetadataItems } = useObjectMetadataItems();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const targetObjectReadPermissions: Record<string, boolean> = {};

  for (const metadataItem of objectMetadataItems) {
    targetObjectReadPermissions[metadataItem.nameSingular] = store.get(
      objectPermissionsFamilySelector.selectorFamily({
        objectNameSingular: metadataItem.nameSingular,
      }),
    ).canRead;
  }

  const targetObjectWritePermissions: Record<string, boolean> = {};

  for (const metadataItem of objectMetadataItems) {
    targetObjectWritePermissions[metadataItem.nameSingular] = store.get(
      objectPermissionsFamilySelector.selectorFamily({
        objectNameSingular: metadataItem.nameSingular,
      }),
    ).canUpdate;
  }

  const featureFlags: Record<string, boolean> = {};

  for (const flag of currentWorkspace?.featureFlags ?? []) {
    featureFlags[flag.key] = flag.value === true;
  }

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
    numberOfSelectedRecords: contextStoreNumberOfSelectedRecords,
    viewType: viewType ?? undefined,
    targetObjectReadPermissions,
    targetObjectWritePermissions,
    featureFlags,
  };
};
