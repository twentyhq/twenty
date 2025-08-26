import { RecordTableCellSkeletonLoader } from '@/object-record/record-table/record-table-cell/components/RecordTableCellSkeletonLoader';
import { RecordTableTd } from 'twenty-ui/record-table';

export const RecordTableCellLoading = () => {
  return (
    <RecordTableTd>
      <RecordTableCellSkeletonLoader />
    </RecordTableTd>
  );
};
