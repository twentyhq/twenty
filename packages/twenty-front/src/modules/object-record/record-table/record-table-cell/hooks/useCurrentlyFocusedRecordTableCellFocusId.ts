import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { getRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/utils/getRecordTableCellFocusId';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useCurrentlyFocusedRecordTableCellFocusId = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const focusPosition = useRecoilComponentValueV2(
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
