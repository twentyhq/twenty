import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { ReactNode, useContext } from 'react';
import { MOBILE_VIEWPORT, ThemeContext } from 'twenty-ui/theme';

export const RECORD_TABLE_TD_WIDTH = '32px';

const StyledTd = styled.td<{
  backgroundColor: string;
  borderColor: string;
  bottomBorderColor: string;
  isDragging?: boolean;
  fontColor: string;
  sticky?: boolean;
  freezeFirstColumns?: boolean;
  left?: number;
  hasRightBorder?: boolean;
  hasTopBorder?: boolean;
  hasBottomBorder?: boolean;
  width?: number;
  isSelected?: boolean;
}>`
  border-bottom: 1px solid
    ${({ bottomBorderColor, hasBottomBorder, isDragging }) =>
      hasBottomBorder && !isDragging ? bottomBorderColor : 'transparent'};

  color: ${({ fontColor }) => fontColor};
  border-right: ${({ borderColor, hasRightBorder, isDragging }) =>
    hasRightBorder && !isDragging ? `1px solid ${borderColor}` : 'none'};

  padding: 0;
  transition: 0.3s ease;

  text-align: left;

  background: ${({ backgroundColor, isDragging }) =>
    isDragging ? 'transparent' : backgroundColor};

  ${({ freezeFirstColumns }) =>
    freezeFirstColumns
      ? `@media (max-width: ${MOBILE_VIEWPORT}px) {
      width: ${RECORD_TABLE_TD_WIDTH};
      max-width: ${RECORD_TABLE_TD_WIDTH};
    }`
      : ''}

  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ bottomBorderColor, isSelected }) =>
      isSelected ? bottomBorderColor : 'transparent'};
  }
`;

export const RecordTableTd = ({
  children,
  isSelected,
  isDragging,
  sticky,
  freezeFirstColumns,
  left,
  hasRightBorder = true,
  hasBottomBorder = true,
  width,
  colSpan,
  ...dragHandleProps
}: {
  className?: string;
  children?: ReactNode;
  isSelected?: boolean;
  isPreviousRowSelected?: boolean;
  isDragging?: boolean;
  sticky?: boolean;
  freezeFirstColumns?: boolean;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
  left?: number;
  width?: number;
  colSpan?: number;
} & (Partial<DraggableProvidedDragHandleProps> | null)) => {
  const { theme } = useContext(ThemeContext);

  const tdBackgroundColor = isSelected
    ? theme.accent.quaternary
    : theme.background.primary;

  const borderColor = theme.border.color.light;
  const bottomBorderColor = isSelected
    ? theme.adaptiveColors.blue3
    : theme.border.color.light;
  const fontColor = theme.font.color.primary;

  return (
    <StyledTd
      isDragging={isDragging}
      backgroundColor={tdBackgroundColor}
      borderColor={borderColor}
      bottomBorderColor={bottomBorderColor}
      fontColor={fontColor}
      sticky={sticky}
      freezeFirstColumns={freezeFirstColumns}
      left={left}
      hasRightBorder={hasRightBorder}
      hasBottomBorder={isSelected ? true : hasBottomBorder}
      width={width}
      colSpan={colSpan}
      isSelected={isSelected}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
    >
      {children}
    </StyledTd>
  );
};
