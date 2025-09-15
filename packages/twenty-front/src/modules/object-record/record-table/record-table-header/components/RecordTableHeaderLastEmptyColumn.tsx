import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthClassName';
import styled from '@emotion/styled';
import { cx } from '@linaria/core';

const StyledLastColumnHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  background-color: ${({ theme }) => theme.background.primary};
  border-left: none !important;
  color: ${({ theme }) => theme.font.color.tertiary};

  height: 32px;
  max-height: 32px;
`;

export const RecordTableHeaderLastEmptyColumn = () => {
  return (
    <StyledLastColumnHeader
      className={cx(
        'header-cell',
        RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME,
      )}
    />
  );
};
