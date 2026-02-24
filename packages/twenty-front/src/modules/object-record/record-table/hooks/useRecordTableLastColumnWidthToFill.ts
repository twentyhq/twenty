import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { shouldCompactRecordTableFirstColumnComponentState } from '@/object-record/record-table/states/shouldCompactRecordTableFirstColumnComponentState';
import { computeLastRecordTableColumnWidth } from '@/object-record/record-table/utils/computeLastRecordTableColumnWidth';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

export const useRecordTableLastColumnWidthToFill = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const recordTableWidth = useRecoilComponentValueV2(
    recordTableWidthComponentState,
  );

  const shouldCompactRecordTableFirstColumn = useRecoilComponentValueV2(
    shouldCompactRecordTableFirstColumnComponentState,
  );

  const { lastColumnWidth } = computeLastRecordTableColumnWidth({
    recordFields: visibleRecordFields,
    tableWidth: recordTableWidth,
    shouldCompactFirstColumn: shouldCompactRecordTableFirstColumn,
  });

  return {
    lastColumnWidth,
  };
};
