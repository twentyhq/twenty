import { type ShouldBeRegisteredFunctionParams } from '@/command-menu-item/types/ShouldBeRegisteredFunctionParams';
import { getCommandMenuItemViewType } from '@/command-menu-item/utils/getCommandMenuItemViewType';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsFamilySelector';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/hooks/useNavigationMenuItemsData';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useCallback, useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import type { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useShouldCommandMenuItemBeRegisteredParams = ({
  objectMetadataItem,
}: {
  objectMetadataItem?: ObjectMetadataItem;
}): ShouldBeRegisteredFunctionParams => {
  const store = useStore();
  const { navigationMenuItems } = useNavigationMenuItemsData();

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const recordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const isFavorite = useMemo(() => {
    if (!isDefined(recordId) || !isDefined(objectMetadataItem)) {
      return false;
    }

    const foundNavigationMenuItem = navigationMenuItems?.find(
      (item) =>
        item.targetRecordId === recordId &&
        item.targetObjectMetadataId === objectMetadataItem.id,
    );
    return !!foundNavigationMenuItem;
  }, [recordId, objectMetadataItem, navigationMenuItems]);

  const selectedRecord =
    useAtomFamilyStateValue(recordStoreFamilyState, recordId ?? '') ||
    undefined;

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem?.id ?? '',
  );

  const isNoteOrTask =
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Note ||
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Task;

  const { isInSidePanel } = useContext(CommandMenuContext);

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

  const viewType = getCommandMenuItemViewType(
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
    isInSidePanel,
    hasAnySoftDeleteFilterOnView,
    isShowPage,
    isSelectAll,
    selectedRecord,
    numberOfSelectedRecords: contextStoreNumberOfSelectedRecords,
    viewType: viewType ?? undefined,
    getTargetObjectReadPermission: getObjectReadPermission,
    getTargetObjectWritePermission: getObjectWritePermission,
    isFeatureFlagEnabled,
  };
};
