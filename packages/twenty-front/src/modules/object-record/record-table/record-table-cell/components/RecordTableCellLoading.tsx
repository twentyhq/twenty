import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { styled } from '@linaria/react';
import { Skeleton } from 'twenty-ui/primitives/feedback';

const StyledCellSkeleton = styled(Skeleton)`
  display: block;
  margin: 8px;
  width: calc(100% - 16px);
`;

export const RecordTableCellLoading = ({
  recordFieldIndex,
  isSelected = false,
}: {
  recordFieldIndex: number;
  isSelected?: boolean;
}) => {
  return (
    <RecordTableCellStyleWrapper
      widthClassName={getRecordTableColumnFieldWidthClassName(recordFieldIndex)}
      isSelected={isSelected}
    >
      <StyledCellSkeleton animated={false} height={16} />
    </RecordTableCellStyleWrapper>
  );
};
