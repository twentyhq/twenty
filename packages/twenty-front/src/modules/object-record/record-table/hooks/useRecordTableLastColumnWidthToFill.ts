import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { shouldCompactRecordTableFirstColumnComponentState } from '@/object-record/record-table/states/shouldCompactRecordTableFirstColumnComponentState';
import { computeLastRecordTableColumnWidth } from '@/object-record/record-table/utils/computeLastRecordTableColumnWidth';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const useRecordTableLastColumnWidthToFill = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const recordTableWidth = useAtomComponentValue(
    recordTableWidthComponentState,
  );

  const shouldCompactRecordTableFirstColumn = useAtomComponentValue(
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
