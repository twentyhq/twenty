import { useRecoilCallback } from 'recoil';

import { getRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/utils/getRecordTableCellFocusId';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetIsRecordTableCellFocusActive } from './useSetIsRecordTableCellFocusActive';

export const useUnfocusRecordTableCell = (recordTableId?: string) => {
  const recordTableIdFromProps = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const focusPositionState = useRecoilComponentCallbackStateV2(
    recordTableFocusPositionComponentState,
    recordTableIdFromProps,
  );

  const { setIsRecordTableCellFocusActive } =
    useSetIsRecordTableCellFocusActive(recordTableIdFromProps);

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const unfocusRecordTableCell = useRecoilCallback(
    ({ snapshot }) => {
      return () => {
        const currentPosition = snapshot
          .getLoadable(focusPositionState)
          .getValue();

        const currentCellFocusId = getRecordTableCellFocusId({
          recordTableId: recordTableIdFromProps,
          cellPosition: currentPosition,
        });

        removeFocusItemFromFocusStackById({
          focusId: currentCellFocusId,
        });

        setIsRecordTableCellFocusActive({
          isRecordTableFocusActive: false,
          cellPosition: currentPosition,
        });
      };
    },
    [
      focusPositionState,
      recordTableIdFromProps,
      removeFocusItemFromFocusStackById,
      setIsRecordTableCellFocusActive,
    ],
  );

  return { unfocusRecordTableCell };
};
