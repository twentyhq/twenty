import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidthClassName';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { styled } from '@linaria/react';
import { cx } from '@linaria/core';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPlaceholderDragAndDropCell = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.background.primary};
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  left: 0;
  overflow: hidden;
  position: sticky;
`;

export const RecordTableDragAndDropPlaceholderCell = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <StyledPlaceholderDragAndDropCell
      className={cx(
        RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME,
        className,
      )}
    />
  );
};
