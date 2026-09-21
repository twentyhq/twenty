import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useIsRecordTableCheckboxColumnHidden } from '@/object-record/record-table/hooks/useIsRecordTableCheckboxColumnHidden';
import { useRecordTableFirstColumnWidthOverride } from '@/object-record/record-table/hooks/useRecordTableFirstColumnWidthOverride';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { computeLastRecordTableColumnWidth } from '@/object-record/record-table/utils/computeLastRecordTableColumnWidth';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useRecordTableLastColumnWidthToFill = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const recordTableWidth = useAtomComponentStateValue(
    recordTableWidthComponentState,
  );

  const firstColumnWidthOverride = useRecordTableFirstColumnWidthOverride();

  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden =
    useIsRecordTableCheckboxColumnHidden();

  const { lastColumnWidth } = computeLastRecordTableColumnWidth({
    recordFields: visibleRecordFields,
    tableWidth: recordTableWidth,
    firstColumnWidthOverride,
    isDragColumnHidden: isRecordTableDragColumnHidden,
    isCheckboxColumnHidden: isRecordTableCheckboxColumnHidden,
  });

  return {
    lastColumnWidth,
  };
};
