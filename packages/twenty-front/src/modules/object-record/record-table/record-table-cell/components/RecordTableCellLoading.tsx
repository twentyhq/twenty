import { RecordTableCellSkeletonLoader } from '@/object-record/record-table/record-table-cell/components/RecordTableCellSkeletonLoader';

export const RecordTableCellLoading = ({
  skeletonWidth,
}: {
  skeletonWidth?: number;
}) => {
  return (
    <td>
      <RecordTableCellSkeletonLoader skeletonWidth={skeletonWidth} />
    </td>
  );
};
