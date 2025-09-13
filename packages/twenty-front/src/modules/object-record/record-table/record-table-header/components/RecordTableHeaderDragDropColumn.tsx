import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidthClassName';
import { cx } from '@linaria/core';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme';

const StyledDragDropHeaderCell = styled.div<{ backgroundColor: string }>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  min-width: 16px;
  width: 16px;
  max-width: 16px;
  min-height: 32px;
  max-height: 32px;

  border-bottom: 1px solid ${({ backgroundColor }) => backgroundColor};
`;

export const RecordTableHeaderDragDropColumn = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledDragDropHeaderCell
      className={cx(
        'header-cell',
        RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH_CLASS_NAME,
      )}
      backgroundColor={theme.background.primary}
    />
  );
};
