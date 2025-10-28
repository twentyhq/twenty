import { RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnWithGroupLastEmptyColumnWidthClassName';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import styled from '@emotion/styled';
import { cx } from '@linaria/core';

const StyledPlaceholderLastDynamicFillingCell = styled.div`
  height: ${RECORD_TABLE_ROW_HEIGHT}px;
`;

export const RecordTableGroupSectionLastDynamicFillingCell = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <StyledPlaceholderLastDynamicFillingCell
      className={cx(
        RECORD_TABLE_COLUMN_WITH_GROUP_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME,
        className,
      )}
    />
  );
};
