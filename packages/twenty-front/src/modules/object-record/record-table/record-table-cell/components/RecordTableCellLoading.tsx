import { RecordTableTd } from '@/object-record/record-table/components/RecordTableTd';
import { RecordTableCellSkeletonLoader } from '@/object-record/record-table/record-table-cell/components/RecordTableCellSkeletonLoader';

export const RecordTableCellLoading = () => {
  return (
    <RecordTableTd>
      <RecordTableCellSkeletonLoader />
    </RecordTableTd>
  );
};
