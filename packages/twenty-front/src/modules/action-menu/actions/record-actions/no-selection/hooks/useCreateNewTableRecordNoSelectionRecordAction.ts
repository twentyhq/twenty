import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
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

    const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

    const { createNewIndexRecord } = useCreateNewIndexRecord({
      objectMetadataItem,
    });

    return {
      shouldBeRegistered: !hasObjectReadOnlyPermission,
      onClick: createNewIndexRecord,
    };
  };
