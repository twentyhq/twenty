import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { useContext } from 'react';

export const useNavigateToPreviousRecordSingleRecordAction: ActionHookWithObjectMetadataItem =
  ({ recordIds, objectMetadataItem }) => {
    const { isInRightDrawer } = useContext(ActionMenuContext);

    const recordId = recordIds[0];

    const { navigateToPreviousRecord } = useRecordShowPagePagination(
      objectMetadataItem.nameSingular,
      recordId,
    );

    return {
      shouldBeRegistered: !isInRightDrawer,
      onClick: navigateToPreviousRecord,
    };
  };
