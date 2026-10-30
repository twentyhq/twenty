import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { css } from '@linaria/core';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const cellSkeletonClassName = css`
  border-radius: ${themeCssVariables.border.radius.sm};
  height: ${SKELETON_HEIGHT_SIZES.s}px;
  margin: ${themeCssVariables.spacing[2]};
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
      <Skeleton className={cellSkeletonClassName} animated={false} />
    </RecordTableCellStyleWrapper>
  );
};
