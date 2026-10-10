import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { styled } from '@linaria/react';
import { Skeleton } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCellSkeletonContainer = styled.div`
  display: flex;
  padding: 8px;
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
      <StyledCellSkeletonContainer>
        <Skeleton
          render={<div />}
          height={16}
          animated={false}
          baseColor={themeCssVariables.background.tertiary}
          borderRadius={themeCssVariables.border.radius.sm}
        />
      </StyledCellSkeletonContainer>
    </RecordTableCellStyleWrapper>
  );
};
