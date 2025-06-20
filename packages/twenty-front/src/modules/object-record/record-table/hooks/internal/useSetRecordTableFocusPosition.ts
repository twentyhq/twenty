import { useRecoilCallback } from 'recoil';

import { getRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/utils/getRecordTableCellFocusId';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetIsRecordTableFocusActive } from '../../record-table-cell/hooks/useSetIsRecordTableFocusActive';
import { TableCellPosition } from '../../types/TableCellPosition';

export const useSetRecordTableFocusPosition = (recordTableId?: string) => {
  const recordTableIdFromProps = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const focusPositionState = useRecoilComponentCallbackStateV2(
    recordTableFocusPositionComponentState,
    recordTableIdFromProps,
  );

  const { setIsFocusActive, setIsFocusActiveForCurrentPosition } =
    useSetIsRecordTableFocusActive(recordTableIdFromProps);

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  return useRecoilCallback(
    ({ set, snapshot }) => {
      return (newPosition: TableCellPosition) => {
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

        set(focusPositionState, newPosition);

        setIsFocusActiveForCurrentPosition(false);
        setIsFocusActive(true, newPosition);

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
          hotkeyScope: {
            scope: TableHotkeyScope.TableFocus,
          },
          memoizeKey: cellFocusId,
        });
      };
    },
    [
      focusPositionState,
      setIsFocusActiveForCurrentPosition,
      setIsFocusActive,
      recordTableIdFromProps,
      pushFocusItemToFocusStack,
      removeFocusItemFromFocusStackById,
    ],
  );
};
