import { StyledTableDiv } from '@/object-record/record-table/components/RecordTableStyles';
import { RecordTableEmptyState } from '@/object-record/record-table/empty-state/components/RecordTableEmptyState';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import styled from '@emotion/styled';

const StyledEmptyStateContainer = styled.div`
  height: 100%;
  overflow: hidden;
`;

export interface RecordTableEmptyProps {
  tableBodyRef: React.RefObject<HTMLTableElement>;
}

export const RecordTableEmpty = ({ tableBodyRef }: RecordTableEmptyProps) => (
  <StyledEmptyStateContainer>
    <StyledTableDiv ref={tableBodyRef}>
      <RecordTableHeader />
    </StyledTableDiv>
    <RecordTableEmptyState />
  </StyledEmptyStateContainer>
);
