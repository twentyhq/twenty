import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useCreateNewTableRecord } from '@/object-record/record-table/hooks/useCreateNewTableRecords';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useCreateNewTableRecordNoSelectionRecordAction: ActionHookWithObjectMetadataItem =
  ({ objectMetadataItem }) => {
    const currentViewId = useRecoilComponentValueV2(
      contextStoreCurrentViewIdComponentState,
    );

    if (!currentViewId) {
      throw new Error('Current view ID is not defined');
    }

    const recordTableId = getRecordIndexIdFromObjectNamePluralAndViewId(
      objectMetadataItem.namePlural,
      currentViewId,
    );

    const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

    const { createNewTableRecord } = useCreateNewTableRecord({
      objectMetadataItem,
      recordTableId,
    });

    const onClick = () => {
      createNewTableRecord();
    };

    return {
      shouldBeRegistered: !hasObjectReadOnlyPermission,
      onClick,
    };
  };
