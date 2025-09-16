import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import styled from '@emotion/styled';
import { cx } from '@linaria/core';

const StyledPlaceholderDragAndDropCell = styled.div`
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;
  min-width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH}px;

  background-color: ${({ theme }) => theme.background.primary};

  border-bottom: 1px solid ${({ theme }) => theme.background.primary};

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
