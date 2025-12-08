import { RecordTableCellCheckbox } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckbox';
import { RecordTableCellDragAndDrop } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDragAndDrop';
import { RecordTableLastEmptyCell } from '@/object-record/record-table/record-table-cell/components/RecordTableLastEmptyCell';
import { RecordTablePlusButtonCellPlaceholder } from '@/object-record/record-table/record-table-cell/components/RecordTablePlusButtonCellPlaceholder';
import { RecordTableDraggableTr } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTr';
import { RecordTableFieldsCells } from '@/object-record/record-table/record-table-row/components/RecordTableFieldsCells';
import { RecordTableRowArrowKeysEffect } from '@/object-record/record-table/record-table-row/components/RecordTableRowArrowKeysEffect';
import { RecordTableRowHotkeyEffect } from '@/object-record/record-table/record-table-row/components/RecordTableRowHotkeyEffect';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { RecordTableRowVirtualizedSkeleton } from '@/object-record/record-table/virtualization/components/RecordTableRowVirtualizedSkeleton';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';

import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

type RecordTableRowVirtualizedFullDataProps = {
  realIndex: number;
};

// TODO: Full Data will take its full meaning when we'll have different levels of data : with relations, only identifiers, etc.
export const RecordTableRowVirtualizedFullData = ({
  realIndex,
}: RecordTableRowVirtualizedFullDataProps) => {
  const isFocused = useRecoilComponentFamilyValue(
    isRecordTableRowFocusedComponentFamilyState,
    realIndex ?? 0,
  );

  const isRowFocusActive = useRecoilComponentValue(
    isRecordTableRowFocusActiveComponentState,
  );

  const recordId = useRecoilComponentFamilyValue(
    recordIdByRealIndexComponentFamilyState,
    { realIndex },
  );

  if (!isDefined(recordId)) {
    return <RecordTableRowVirtualizedSkeleton />;
  }

  return (
    <RecordTableDraggableTr
      recordId={recordId}
      draggableIndex={realIndex}
      focusIndex={realIndex}
    >
      {isRowFocusActive && isFocused && (
        <>
          <RecordTableRowHotkeyEffect />
          <RecordTableRowArrowKeysEffect />
        </>
      )}
      <RecordTableCellDragAndDrop />
      <RecordTableCellCheckbox />
      <RecordTableFieldsCells />
      <RecordTablePlusButtonCellPlaceholder />
      <RecordTableLastEmptyCell />
    </RecordTableDraggableTr>
  );
};
