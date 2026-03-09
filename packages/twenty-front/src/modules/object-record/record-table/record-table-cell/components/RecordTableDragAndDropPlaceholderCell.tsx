import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { styled } from '@linaria/react';
import { cx } from '@linaria/core';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPlaceholderDragAndDropCell = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.background.primary};
  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  left: 0;

  min-width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;

  position: sticky;
  width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
`;

export const RecordTableDragAndDropPlaceholderCell = ({
  className,
}: {
  className?: string;
}) => {
  return <StyledPlaceholderDragAndDropCell className={cx(className)} />;
};
