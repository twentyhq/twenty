import { StyledTd } from '@/object-record/record-table/components/RecordTableRow';
import { RecordTableCellSkeletonLoader } from '@/object-record/record-table/record-table-cell/components/RecordTableCellSkeletonLoader';

export const RecordTableCellLoading = () => {
  return (
    <StyledTd>
      <RecordTableCellSkeletonLoader />
    </StyledTd>
  );
};
