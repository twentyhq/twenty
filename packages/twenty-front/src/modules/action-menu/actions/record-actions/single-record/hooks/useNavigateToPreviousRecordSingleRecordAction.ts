import { SingleRecordActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/SingleRecordActionHook';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useRecordShowPagePagination } from '@/object-record/record-show/hooks/useRecordShowPagePagination';
import { useContext } from 'react';

export const useNavigateToPreviousRecordSingleRecordAction: SingleRecordActionHookWithObjectMetadataItem =
  ({ recordId, objectMetadataItem }) => {
    const { isInRightDrawer } = useContext(ActionMenuContext);
    const { navigateToPreviousRecord } = useRecordShowPagePagination(
      objectMetadataItem.nameSingular,
      recordId,
    );

    return {
      shouldBeRegistered: !isInRightDrawer,
      onClick: navigateToPreviousRecord,
    };
  };
