import { forceRegisteredActionsByKeyState } from '@/action-menu/actions/states/forceRegisteredActionsMapComponentState';
import { type ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { getActionViewType } from '@/action-menu/actions/utils/getActionViewType';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { objectPermissionsFamilySelector } from '@/auth/states/objectPermissionsFamilySelector';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useContext } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

export const useShouldActionBeRegisteredParams = ({
  objectMetadataItem,
}: {
  objectMetadataItem?: ObjectMetadataItem;
}): ShouldBeRegisteredFunctionParams => {
  const { sortedFavorites: favorites } = useFavorites();

  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const recordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const foundFavorite = favorites?.find(
    (favorite) => favorite.recordId === recordId,
  );

  const isFavorite = !!foundFavorite;

  const selectedRecord =
    useRecoilValue(recordStoreFamilyState(recordId ?? '')) || undefined;

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem?.id ?? '',
  );

  const isNoteOrTask =
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Note ||
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Task;

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const hasAnySoftDeleteFilterOnView = useRecoilComponentValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const isShowPage =
    useRecoilComponentValue(contextStoreCurrentViewTypeComponentState) ===
    ContextStoreViewType.ShowPage;

  const numberOfSelectedRecords = useRecoilComponentValue(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const contextStoreCurrentViewType = useRecoilComponentValue(
    contextStoreCurrentViewTypeComponentState,
  );

  const viewType = getActionViewType(
    contextStoreCurrentViewType,
    contextStoreTargetedRecordsRule,
  );

  const getObjectReadPermission = useRecoilCallback(
    ({ snapshot }) =>
      (objectMetadataNameSingular: string) => {
        return snapshot
          .getLoadable(
            objectPermissionsFamilySelector({
              objectNameSingular: objectMetadataNameSingular,
            }),
          )
          .getValue().canRead;
      },
    [],
  );

  const getObjectWritePermission = useRecoilCallback(
    ({ snapshot }) =>
      (objectMetadataNameSingular: string) => {
        return snapshot
          .getLoadable(
            objectPermissionsFamilySelector({
              objectNameSingular: objectMetadataNameSingular,
            }),
          )
          .getValue().canUpdate;
      },
    [],
  );

  const forceRegisteredActionsByKey = useRecoilValue(
    forceRegisteredActionsByKeyState,
  );

  return {
    objectMetadataItem,
    isFavorite,
    objectPermissions,
    isNoteOrTask,
    isInRightDrawer,
    hasAnySoftDeleteFilterOnView,
    isShowPage,
    selectedRecord,
    numberOfSelectedRecords,
    viewType: viewType ?? undefined,
    getTargetObjectReadPermission: getObjectReadPermission,
    getTargetObjectWritePermission: getObjectWritePermission,
    forceRegisteredActionsByKey,
  };
};
