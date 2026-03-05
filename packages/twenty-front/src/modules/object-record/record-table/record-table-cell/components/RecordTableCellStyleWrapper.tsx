import { type DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { cx } from '@linaria/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

export const StyledCell = styled.div<{
  backgroundColor: string;
  borderColor: string;
  isDragging?: boolean;
  fontColor: string;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
}>`
  border-bottom: 1px solid
    ${({ borderColor, hasBottomBorder, isDragging }) =>
      hasBottomBorder && !isDragging ? borderColor : 'transparent'};

  color: ${({ fontColor }) => fontColor};
  border-right: ${({ borderColor, hasRightBorder }) =>
    hasRightBorder ? `1px solid ${borderColor}` : 'none'};

  padding: 0;

  text-align: left;

  background: ${({ backgroundColor, isDragging }) =>
    isDragging ? 'transparent' : backgroundColor};
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
  const tdBackgroundColor = isSelected
    ? resolveThemeVariable(themeCssVariables.accent.quaternary)
    : resolveThemeVariable(themeCssVariables.background.primary);

  const borderColor = resolveThemeVariable(
    themeCssVariables.border.color.light,
  );

  const fontColor = resolveThemeVariable(themeCssVariables.font.color.primary);

  return (
    <StyledCell
      isDragging={isDragging}
      backgroundColor={tdBackgroundColor}
      borderColor={borderColor}
      fontColor={fontColor}
      hasRightBorder={hasRightBorder}
      hasBottomBorder={hasBottomBorder}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
      className={cx('table-cell', widthClassName)}
    >
      {children}
    </StyledCell>
  );
};
