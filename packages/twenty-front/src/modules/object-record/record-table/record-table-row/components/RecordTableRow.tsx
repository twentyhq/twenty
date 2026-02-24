import { RecordTableCellCheckbox } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckbox';
import { RecordTableCellDragAndDrop } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDragAndDrop';
import { RecordTableLastEmptyCell } from '@/object-record/record-table/record-table-cell/components/RecordTableLastEmptyCell';
import { RecordTablePlusButtonCellPlaceholder } from '@/object-record/record-table/record-table-cell/components/RecordTablePlusButtonCellPlaceholder';

import { RecordTableDraggableTr } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTr';
import { RecordTableDraggableTrFirstRowOfGroup } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTrFirstRowOfGroup';
import { RecordTableFieldsCells } from '@/object-record/record-table/record-table-row/components/RecordTableFieldsCells';
import { RecordTableRowArrowKeysEffect } from '@/object-record/record-table/record-table-row/components/RecordTableRowArrowKeysEffect';
import { RecordTableRowHotkeyEffect } from '@/object-record/record-table/record-table-row/components/RecordTableRowHotkeyEffect';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

type RecordTableRowProps = {
  recordId: string;
  rowIndexForFocus: number;
  rowIndexForDrag: number;
  isFirstRowOfGroup: boolean;
};

export const RecordTableRow = ({
  recordId,
  rowIndexForFocus,
  rowIndexForDrag,
  isFirstRowOfGroup,
}: RecordTableRowProps) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const isFocused = useRecoilComponentFamilyValueV2(
    isRecordTableRowFocusedComponentFamilyState,
    rowIndexForFocus,
  );
  const isRowFocusActive = useRecoilComponentValueV2(
    isRecordTableRowFocusActiveComponentState,
    recordTableId,
  );

  return isFirstRowOfGroup ? (
    <RecordTableDraggableTrFirstRowOfGroup
      recordId={recordId}
      draggableIndex={rowIndexForDrag}
      focusIndex={rowIndexForFocus}
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
    </RecordTableDraggableTrFirstRowOfGroup>
  ) : (
    <RecordTableDraggableTr
      recordId={recordId}
      draggableIndex={rowIndexForDrag}
      focusIndex={rowIndexForFocus}
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
