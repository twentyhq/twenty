import { type DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme';

export const DEFAULT_RECORD_TABLE_TD_WIDTH = 32;

const StyledTd = styled.td<{
  backgroundColor: string;
  borderColor: string;
  isDragging?: boolean;
  fontColor: string;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
  width: number;
}>`
  min-width: ${({ width }) => width}px;
  width: ${({ width }) => width}px;
  max-width: ${({ width }) => width}px;

  border-bottom: 1px solid
    ${({ borderColor, hasBottomBorder, isDragging }) =>
      hasBottomBorder && !isDragging ? borderColor : 'transparent'};

  color: ${({ fontColor }) => fontColor};
  border-right: ${({ borderColor, hasRightBorder, isDragging }) =>
    hasRightBorder && !isDragging ? `1px solid ${borderColor}` : 'none'};

  padding: 0;

  text-align: left;

  background: ${({ backgroundColor, isDragging }) =>
    isDragging ? 'transparent' : backgroundColor};

  // TODO: reimplement horizontal scroll here once we have refactored body with divs
`;

export const RecordTableTd = ({
  children,
  isSelected,
  isDragging,
  hasRightBorder = true,
  hasBottomBorder = true,
  width = DEFAULT_RECORD_TABLE_TD_WIDTH,
  ...dragHandleProps
}: {
  className?: string;
  children?: ReactNode;
  isSelected?: boolean;
  isDragging?: boolean;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
  width?: number;
} & (Partial<DraggableProvidedDragHandleProps> | null)) => {
  const { theme } = useContext(ThemeContext);

  const tdBackgroundColor = isSelected
    ? theme.accent.quaternary
    : theme.background.primary;

  const borderColor = theme.border.color.light;

  const fontColor = theme.font.color.primary;

  return (
    <StyledTd
      isDragging={isDragging}
      backgroundColor={tdBackgroundColor}
      borderColor={borderColor}
      fontColor={fontColor}
      hasRightBorder={hasRightBorder}
      hasBottomBorder={hasBottomBorder}
      width={width}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
    >
      {children}
    </StyledTd>
  );
};
