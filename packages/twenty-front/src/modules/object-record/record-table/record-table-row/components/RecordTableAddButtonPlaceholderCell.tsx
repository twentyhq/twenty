import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import styled from '@emotion/styled';
import { cx } from '@linaria/core';

const StyledPlaceholderAddButtonCell = styled.div`
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
  width: ${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH}px;
`;

export const RecordTableAddButtonPlaceholderCell = ({
  className,
}: {
  className?: string;
}) => {
  return <StyledPlaceholderAddButtonCell className={cx(className)} />;
};
