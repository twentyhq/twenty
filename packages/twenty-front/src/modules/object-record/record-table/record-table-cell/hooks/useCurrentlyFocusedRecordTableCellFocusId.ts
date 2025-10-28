import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { getRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/utils/getRecordTableCellFocusId';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const useCurrentlyFocusedRecordTableCellFocusId = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const focusPosition = useRecoilComponentValue(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  return isDefined(focusPosition)
    ? getRecordTableCellFocusId({
        recordTableId,
        cellPosition: focusPosition,
      })
    : null;
};
