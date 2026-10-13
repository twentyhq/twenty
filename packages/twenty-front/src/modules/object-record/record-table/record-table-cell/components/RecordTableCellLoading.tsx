import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { styled } from '@linaria/react';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCellSkeleton = styled.div`
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  height: ${SKELETON_HEIGHT_SIZES.s}px;
  margin: ${themeCssVariables.spacing[2]};
`;

export const RecordTableCellLoading = ({
  recordFieldIndex,
  isSelected = false,
}: {
  recordFieldIndex: number;
  isSelected?: boolean;
}) => (
  <RecordTableCellStyleWrapper
    widthClassName={getRecordTableColumnFieldWidthClassName(recordFieldIndex)}
    isSelected={isSelected}
  >
    <StyledCellSkeleton aria-hidden />
  </RecordTableCellStyleWrapper>
);
