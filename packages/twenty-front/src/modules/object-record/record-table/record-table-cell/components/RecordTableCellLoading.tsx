import { RecordTableCellSkeletonLoader } from '@/object-record/record-table/record-table-cell/components/RecordTableCellSkeletonLoader';
import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';

export const RecordTableCellLoading = ({
  recordFieldIndex,
}: {
  recordFieldIndex: number;
}) => {
  return (
    <RecordTableCellStyleWrapper
      widthClassName={getRecordTableColumnFieldWidthClassName(recordFieldIndex)}
    >
      <RecordTableCellSkeletonLoader />
    </RecordTableCellStyleWrapper>
  );
};
