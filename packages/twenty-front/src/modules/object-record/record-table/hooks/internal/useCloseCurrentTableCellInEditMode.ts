import { useRecoilCallback } from 'recoil';

import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useRemoveLastFocusItemFromFocusStackByComponentType } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackByComponentType';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useCloseCurrentTableCellInEditMode = (recordTableId?: string) => {
  const currentTableCellInEditModePositionState =
    useRecoilComponentCallbackStateV2(
      recordTableCellEditModePositionComponentState,
      recordTableId,
    );

  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { removeLastFocusItemFromFocusStackByComponentType } =
    useRemoveLastFocusItemFromFocusStackByComponentType();

  return useRecoilCallback(
    ({ set }) => {
      return () => {
        set(currentTableCellInEditModePositionState, null);

        goBackToPreviousDropdownFocusId();

        removeLastFocusItemFromFocusStackByComponentType({
          componentType: FocusComponentType.OPENED_FIELD_INPUT,
        });
      };
    },
    [
      currentTableCellInEditModePositionState,
      goBackToPreviousDropdownFocusId,
      removeLastFocusItemFromFocusStackByComponentType,
    ],
  );
};
