import { getRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/utils/getRecordTableCellFocusId';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useSetIsRecordTableCellFocusActive } from './useSetIsRecordTableCellFocusActive';

export const useFocusRecordTableCell = (recordTableId?: string) => {
  const recordTableIdFromProps = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const focusPositionCallbackState = useRecoilComponentCallbackState(
    recordTableFocusPositionComponentState,
    recordTableIdFromProps,
  );

  const { setIsRecordTableCellFocusActive } =
    useSetIsRecordTableCellFocusActive(recordTableIdFromProps);

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const focusRecordTableCell = useRecoilCallback(
    ({ snapshot }) => {
      return (newPosition: TableCellPosition) => {
        const currentPosition = snapshot
          .getLoadable(focusPositionCallbackState)
          .getValue();

        if (isDefined(currentPosition)) {
          const currentCellFocusId = getRecordTableCellFocusId({
            recordTableId: recordTableIdFromProps,
            cellPosition: currentPosition,
          });

          removeFocusItemFromFocusStackById({
            focusId: currentCellFocusId,
          });
        }

        setIsRecordTableCellFocusActive({
          isRecordTableFocusActive: true,
          cellPosition: newPosition,
        });

        const cellFocusId = getRecordTableCellFocusId({
          recordTableId: recordTableIdFromProps,
          cellPosition: newPosition,
        });

        pushFocusItemToFocusStack({
          focusId: cellFocusId,
          component: {
            type: FocusComponentType.RECORD_TABLE_CELL,
            instanceId: cellFocusId,
          },
        });
      };
    },
    [
      focusPositionCallbackState,
      recordTableIdFromProps,
      removeFocusItemFromFocusStackById,
      setIsRecordTableCellFocusActive,
      pushFocusItemToFocusStack,
    ],
  );

  return { focusRecordTableCell };
};
