import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { getRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/utils/getRecordTableCellFocusId';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useCurrentlyFocusedRecordTableCellFocusId = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const recordTableFocusPosition = useAtomComponentStateValue(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  return isDefined(recordTableFocusPosition)
    ? getRecordTableCellFocusId({
        recordTableId,
        cellPosition: recordTableFocusPosition,
      })
    : null;
};
