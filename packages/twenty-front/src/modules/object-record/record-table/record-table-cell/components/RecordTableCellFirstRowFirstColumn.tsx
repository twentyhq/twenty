import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { type DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { cx } from '@linaria/core';
import { styled } from '@linaria/react';
import { useContext, type ReactNode } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

const StyledRecordTableTd = styled.div<{
  backgroundColor: string;
  borderColor: string;
  isDragging?: boolean;
  fontColor: string;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
  zIndex: number;
}>`
  background: ${({ backgroundColor, isDragging }) =>
    isDragging ? 'transparent' : backgroundColor};

  border-bottom: 1px solid
    ${({ borderColor, hasBottomBorder, isDragging }) =>
      hasBottomBorder && !isDragging ? borderColor : 'transparent'};
  border-right: ${({ borderColor, hasRightBorder }) =>
    hasRightBorder ? `1px solid ${borderColor}` : 'none'};

  color: ${({ fontColor }) => fontColor};

  padding: 0;

  text-align: left;

  z-index: ${({ zIndex }) => zIndex};
`;

export const RecordTableCellFirstRowFirstColumn = ({
  children,
  isSelected,
  isDragging,
  hasRightBorder = true,
  hasBottomBorder = true,
  ...dragHandleProps
}: {
  className?: string;
  children?: ReactNode;
  isSelected?: boolean;
  isDragging?: boolean;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
} & (Partial<DraggableProvidedDragHandleProps> | null)) => {
  const { theme } = useContext(ThemeContext);

  const zIndex = TABLE_Z_INDEX.cell.sticky;

  const tdBackgroundColor = isSelected
    ? theme.accent.quaternary
    : theme.background.primary;

  const borderColor = theme.border.color.light;

  const fontColor = theme.font.color.primary;

  return (
    <StyledRecordTableTd
      isDragging={isDragging}
      backgroundColor={tdBackgroundColor}
      borderColor={borderColor}
      fontColor={fontColor}
      hasRightBorder={hasRightBorder}
      hasBottomBorder={hasBottomBorder}
      zIndex={zIndex}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
      className={cx(
        'table-cell-0-0',
        getRecordTableColumnFieldWidthClassName(0),
      )}
    >
      {children}
    </StyledRecordTableTd>
  );
};
