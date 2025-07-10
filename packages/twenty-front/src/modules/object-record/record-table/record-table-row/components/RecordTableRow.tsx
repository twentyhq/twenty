import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableCellCheckbox } from '@/object-record/record-table/record-table-cell/components/RecordTableCellCheckbox';
import { RecordTableCellGrip } from '@/object-record/record-table/record-table-cell/components/RecordTableCellGrip';
import { RecordTableLastEmptyCell } from '@/object-record/record-table/record-table-cell/components/RecordTableLastEmptyCell';
import { RecordTableCells } from '@/object-record/record-table/record-table-row/components/RecordTableCells';
import { RecordTableDraggableTr } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTr';
import { RecordTableRowArrowKeysEffect } from '@/object-record/record-table/record-table-row/components/RecordTableRowArrowKeysEffect';
import { RecordTableRowHotkeyEffect } from '@/object-record/record-table/record-table-row/components/RecordTableRowHotkeyEffect';
import { isRecordTableRowFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableRowFocusActiveComponentState';
import { isRecordTableRowFocusedComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowFocusedComponentFamilyState';
import { ListenRecordUpdatesEffect } from '@/subscription/components/ListenRecordUpdatesEffect';
import { getDefaultRecordFieldsToListen } from '@/subscription/utils/getDefaultRecordFieldsToListen.util';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

type RecordTableRowProps = {
  recordId: string;
  rowIndexForFocus: number;
  rowIndexForDrag: number;
};

export const RecordTableRow = ({
  recordId,
  rowIndexForFocus,
  rowIndexForDrag,
}: RecordTableRowProps) => {
  const { objectNameSingular } = useRecordIndexContextOrThrow();
  const listenedFields = getDefaultRecordFieldsToListen({
    objectNameSingular,
  });
  const isFocused = useRecoilComponentFamilyValueV2(
    isRecordTableRowFocusedComponentFamilyState,
    rowIndexForFocus,
  );
  const isRowFocusActive = useRecoilComponentValueV2(
    isRecordTableRowFocusActiveComponentState,
  );

  return (
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
      <RecordTableCellGrip />
      <RecordTableCellCheckbox />
      <RecordTableCells />
      <RecordTableLastEmptyCell />
      <ListenRecordUpdatesEffect
        objectNameSingular={objectNameSingular}
        recordId={recordId}
        listenedFields={listenedFields}
      />
    </RecordTableDraggableTr>
  );
};
