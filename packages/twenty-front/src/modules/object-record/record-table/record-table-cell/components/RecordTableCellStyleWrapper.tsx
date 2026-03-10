import { type DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { cx } from '@linaria/core';
import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

export const StyledCell = styled.div<{
  backgroundColor: string;
  borderColor: string;
  isDragging?: boolean;
  fontColor: string;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
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
`;

export const RecordTableCellStyleWrapper = ({
  children,
  isSelected,
  isDragging,
  hasRightBorder = true,
  hasBottomBorder = true,
  widthClassName,
  ...dragHandleProps
}: {
  className?: string;
  children?: ReactNode;
  isSelected?: boolean;
  isDragging?: boolean;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
  widthClassName: string;
} & (Partial<DraggableProvidedDragHandleProps> | null)) => {
  const { theme } = useContext(ThemeContext);

  const tdBackgroundColor = isSelected
    ? theme.accent.quaternary
    : theme.background.primary;

  const borderColor = theme.border.color.light;

  const fontColor = theme.font.color.primary;

  return (
    <StyledCell
      isDragging={isDragging}
      backgroundColor={tdBackgroundColor}
      borderColor={borderColor}
      fontColor={fontColor}
      hasRightBorder={hasRightBorder}
      hasBottomBorder={hasBottomBorder}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
      className={cx('table-cell', widthClassName)}
    >
      {children}
    </StyledCell>
  );
};
