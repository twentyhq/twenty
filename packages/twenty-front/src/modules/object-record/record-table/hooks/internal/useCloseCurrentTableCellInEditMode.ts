import { useRecoilCallback } from 'recoil';

import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useRemoveLastFocusItemFromFocusStackByComponentType } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackByComponentType';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

export const useCloseCurrentTableCellInEditMode = (recordTableId?: string) => {
  const currentTableCellInEditModePositionState =
    useRecoilComponentCallbackState(
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
