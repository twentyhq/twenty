import { useStore } from 'jotai';
import { useCallback } from 'react';

import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useRemoveLastFocusItemFromFocusStackByComponentType } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackByComponentType';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useCloseCurrentTableCellInEditMode = (recordTableId?: string) => {
  const store = useStore();
  const currentTableCellInEditModePosition = useAtomComponentStateCallbackState(
    recordTableCellEditModePositionComponentState,
    recordTableId,
  );

  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { removeLastFocusItemFromFocusStackByComponentType } =
    useRemoveLastFocusItemFromFocusStackByComponentType();

  return useCallback(() => {
    store.set(currentTableCellInEditModePosition, null);

    goBackToPreviousDropdownFocusId();

    removeLastFocusItemFromFocusStackByComponentType({
      componentType: FocusComponentType.OPENED_FIELD_INPUT,
    });
  }, [
    store,
    currentTableCellInEditModePosition,
    goBackToPreviousDropdownFocusId,
    removeLastFocusItemFromFocusStackByComponentType,
  ]);
};
