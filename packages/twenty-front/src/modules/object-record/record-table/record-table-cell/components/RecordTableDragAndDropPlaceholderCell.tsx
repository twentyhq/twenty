import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { styled } from '@linaria/react';
import { cx } from '@linaria/core';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPlaceholderDragAndDropCell = styled.div`
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
  min-width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;

  background-color: ${themeCssVariables.background.primary};

  border-bottom: 1px solid ${themeCssVariables.background.primary};

  position: sticky;
  left: 0;
`;

export const RecordTableDragAndDropPlaceholderCell = ({
  className,
}: {
  className?: string;
}) => {
  return <StyledPlaceholderDragAndDropCell className={cx(className)} />;
};
