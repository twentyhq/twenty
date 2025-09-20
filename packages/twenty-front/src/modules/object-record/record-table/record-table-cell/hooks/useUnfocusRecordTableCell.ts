import { useRecoilCallback } from 'recoil';

import { getRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/utils/getRecordTableCellFocusId';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { isDefined } from 'twenty-shared/utils';
import { useSetIsRecordTableCellFocusActive } from './useSetIsRecordTableCellFocusActive';

export const useUnfocusRecordTableCell = (recordTableId?: string) => {
  const recordTableIdFromProps = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const focusPositionState = useRecoilComponentCallbackState(
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

        if (!isDefined(currentPosition)) {
          return;
        }

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
