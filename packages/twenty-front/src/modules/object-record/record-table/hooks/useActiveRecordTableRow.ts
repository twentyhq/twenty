import { activeRecordTableRowIndexComponentState } from '@/object-record/record-table/states/activeRecordTableRowIndexComponentState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useActiveRecordTableRow = (recordTableId?: string) => {
  const isRowActiveState = useRecoilComponentCallbackState(
    isRecordTableRowActiveComponentFamilyState,
    recordTableId,
  );

  const activeRowIndexState = useRecoilComponentCallbackState(
    activeRecordTableRowIndexComponentState,
    recordTableId,
  );

  const deactivateRecordTableRow = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const activeRowIndex = snapshot
          .getLoadable(activeRowIndexState)
          .getValue();

        if (!isDefined(activeRowIndex)) {
          return;
        }

        set(activeRowIndexState, null);

        set(isRowActiveState(activeRowIndex), false);
      },
    [activeRowIndexState, isRowActiveState],
  );

  const activateRecordTableRow = useRecoilCallback(
    ({ set, snapshot }) =>
      (rowIndex: number) => {
        const activeRowIndex = snapshot
          .getLoadable(activeRowIndexState)
          .getValue();

        if (activeRowIndex === rowIndex) {
          return;
        }

        if (isDefined(activeRowIndex)) {
          set(isRowActiveState(activeRowIndex), false);
        }

        set(activeRowIndexState, rowIndex);

        set(isRowActiveState(rowIndex), true);
      },
    [activeRowIndexState, isRowActiveState],
  );

  return {
    activateRecordTableRow,
    deactivateRecordTableRow,
  };
};
