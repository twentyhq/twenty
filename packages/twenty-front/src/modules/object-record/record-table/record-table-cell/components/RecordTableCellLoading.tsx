import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { styled } from '@linaria/react';
import { Skeleton } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCellSkeleton = styled(Skeleton)`
  display: block;
  height: 0;
  margin: 8px;
  padding: 8px;
  width: auto;
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
      <StyledCellSkeleton
        render={<div />}
        animated={false}
        baseColor={themeCssVariables.background.tertiary}
        borderRadius={themeCssVariables.border.radius.sm}
      />
    </RecordTableCellStyleWrapper>
  );
};
