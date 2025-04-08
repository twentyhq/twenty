import { RecordTableStickyBottomEffect } from '@/object-record/record-table/components/RecordTableStickyBottomEffect';
import { RecordTableStickyEffect } from '@/object-record/record-table/components/RecordTableStickyEffect';
import { StyledTable } from '@/object-record/record-table/components/RecordTableStyles';
import { RecordTableNoRecordGroupBody } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBody';
import { RecordTableRecordGroupsBody } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupsBody';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';

export interface RecordTableContentProps {
  tableBodyRef: React.RefObject<HTMLTableElement>;
  handleDragSelectionStart: () => void;
  handleDragSelectionEnd: () => void;
  setRowSelected: (rowId: string, selected: boolean) => void;
  hasRecordGroups: boolean;
}

export const RecordTableContent = ({
  tableBodyRef,
  handleDragSelectionStart,
  handleDragSelectionEnd,
  setRowSelected,
  hasRecordGroups,
}: RecordTableContentProps) => (
  <>
    <StyledTable ref={tableBodyRef}>
      <RecordTableHeader />
      {hasRecordGroups ? (
        <RecordTableRecordGroupsBody />
      ) : (
        <RecordTableNoRecordGroupBody />
      )}
      <RecordTableStickyEffect />
      <RecordTableStickyBottomEffect />
    </StyledTable>
    <DragSelect
      dragSelectable={tableBodyRef}
      onDragSelectionStart={handleDragSelectionStart}
      onDragSelectionChange={setRowSelected}
      onDragSelectionEnd={handleDragSelectionEnd}
    />
  </>
);
