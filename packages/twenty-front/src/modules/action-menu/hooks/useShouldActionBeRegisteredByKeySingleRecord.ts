import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isSoftDeleteFilterActiveComponentState } from '@/object-record/record-table/states/isSoftDeleteFilterActiveComponentState';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isNonEmptyString, isNull } from '@sniptt/guards';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useShouldActionBeRegisteredByKeySingleRecord = ({
  objectMetadataItem,
  recordId,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordId: string;
}) => {
  const { sortedFavorites: favorites } = useFavorites();

  const foundFavorite = favorites?.find(
    (favorite) => favorite.recordId === recordId,
  );

  const isFavorite = !!foundFavorite;

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const isRemoteObject = objectMetadataItem.isRemote;

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const isNoteOrTask =
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Note ||
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Task;

  const isInRightDrawer = useContext(ActionMenuContext);

  const isSoftDeleteFilterActive = useRecoilComponentValueV2(
    isSoftDeleteFilterActiveComponentState,
  );

  const isShowPage =
    useRecoilComponentValueV2(contextStoreCurrentViewTypeComponentState) ===
    ContextStoreViewType.ShowPage;

  const shouldBeRegisteredByKey = (key: string) => {
    if (!isDefined(selectedRecord)) {
      return false;
    }

    switch (key) {
      case SingleRecordActionKeys.ADD_TO_FAVORITES:
        return (
          !objectMetadataItem.isRemote &&
          !isFavorite &&
          isNull(selectedRecord.deletedAt)
        );
      case SingleRecordActionKeys.REMOVE_FROM_FAVORITES:
        return !objectMetadataItem.isRemote && isFavorite;
      case SingleRecordActionKeys.DELETE:
        return !hasObjectReadOnlyPermission;
      case SingleRecordActionKeys.DESTROY:
        return (
          !hasObjectReadOnlyPermission &&
          !isRemoteObject &&
          isDefined(selectedRecord?.deletedAt)
        );
      case SingleRecordActionKeys.EXPORT_NOTE_TO_PDF:
        return (
          isNoteOrTask && isNonEmptyString(selectedRecord.bodyV2?.blocknote)
        );
      case SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD:
      case SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD:
        return !isInRightDrawer;

      case SingleRecordActionKeys.RESTORE:
        return (
          !isRemoteObject &&
          isDefined(selectedRecord?.deletedAt) &&
          !hasObjectReadOnlyPermission &&
          (isShowPage || isSoftDeleteFilterActive)
        );
      default:
        return false;
    }
  };

  return {
    shouldBeRegisteredByKey,
  };
};
