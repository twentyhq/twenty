import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { getRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/utils/getRecordTableCellFocusId';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useCurrentlyFocusedRecordTableCellFocusId = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const focusPosition = useRecoilComponentValueV2(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  return getRecordTableCellFocusId({
    recordTableId,
    cellPosition: focusPosition,
  });
};
