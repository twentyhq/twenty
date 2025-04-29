import { activeRecordTableRowIdComponentState } from '@/object-record/record-table/states/activeRecordTableRowIndexComponentState';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useActiveRecordTableRow = (recordTableId?: string) => {
  const isRowActiveState = useRecoilComponentCallbackStateV2(
    isRecordTableRowActiveComponentFamilyState,
    recordTableId,
  );

  const activeRowIdState = useRecoilComponentCallbackStateV2(
    activeRecordTableRowIdComponentState,
    recordTableId,
  );

  const activateRecordTableRow = useRecoilCallback(
    ({ set }) =>
      (recordId: string) => {
        set(activeRowIdState, recordId);

        set(isRowActiveState(recordId), true);
      },
    [activeRowIdState, isRowActiveState],
  );

  const deactivateRecordTableRow = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const activeRowId = snapshot.getLoadable(activeRowIdState).getValue();

        if (!activeRowId) {
          return;
        }

        set(activeRowIdState, null);

        set(isRowActiveState(activeRowId), false);
      },
    [activeRowIdState, isRowActiveState],
  );

  return {
    activateRecordTableRow,
    deactivateRecordTableRow,
  };
};
