import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { getRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/utils/getRecordTableCellFocusId';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useCurrentlyFocusedRecordTableCellFocusId = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const focusPosition = useRecoilComponentValue(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  return getRecordTableCellFocusId({
    recordTableId,
    cellPosition: focusPosition,
  });
};
