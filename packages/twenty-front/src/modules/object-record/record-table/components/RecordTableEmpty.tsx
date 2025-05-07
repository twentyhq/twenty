import { StyledTable } from '@/object-record/record-table/components/RecordTableStyles';
import { RecordTableEmptyState } from '@/object-record/record-table/empty-state/components/RecordTableEmptyState';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';

export interface RecordTableEmptyProps {
  tableBodyRef: React.RefObject<HTMLTableElement>;
  hasRecordGroups: boolean;
}

export const RecordTableEmpty = ({ tableBodyRef }: RecordTableEmptyProps) => (
  <>
    <StyledTable ref={tableBodyRef}>
      <RecordTableHeader />
    </StyledTable>
    <RecordTableEmptyState />
  </>
);
