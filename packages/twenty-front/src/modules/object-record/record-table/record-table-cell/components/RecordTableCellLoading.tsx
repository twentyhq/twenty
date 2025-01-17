import { RecordTableCellSkeletonLoader } from '@/object-record/record-table/record-table-cell/components/RecordTableCellSkeletonLoader';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';

export const RecordTableCellLoading = () => {
  return (
    <RecordTableTd zIndex={2}>
      <RecordTableCellSkeletonLoader />
    </RecordTableTd>
  );
};
