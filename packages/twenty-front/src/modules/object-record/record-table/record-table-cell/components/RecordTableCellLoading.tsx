import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { styled } from '@linaria/react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCellSkeletonContainer = styled.div`
  display: flex;
  padding: ${themeCssVariables.spacing[2]};
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
          height={SKELETON_HEIGHT_SIZES.s}
          animated={false}
          baseColor={themeCssVariables.background.tertiary}
          borderRadius={themeCssVariables.border.radius.sm}
        />
      </StyledCellSkeletonContainer>
    </RecordTableCellStyleWrapper>
  );
};
