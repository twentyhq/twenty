import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { ReactNode, useContext } from 'react';
import { MOBILE_VIEWPORT, ThemeContext } from 'twenty-ui';

export const RECORD_TABLE_TD_WIDTH = '32px';

const StyledTd = styled.td<{
  backgroundColor: string;
  borderColor: string;
  isDragging?: boolean;
  fontColor: string;
  sticky?: boolean;
  freezeFirstColumns?: boolean;
  left?: number;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
  width?: number;
}>`
  border-bottom: 1px solid
    ${({ borderColor, hasBottomBorder }) =>
      hasBottomBorder ? borderColor : 'transparent'};
  color: ${({ fontColor }) => fontColor};
  border-right: ${({ borderColor, hasRightBorder }) =>
    hasRightBorder ? `1px solid ${borderColor}` : 'none'};

  padding: 0;
  transition: 0.3s ease;

  text-align: left;

  background: ${({ backgroundColor }) => backgroundColor};
  ${({ isDragging }) =>
    isDragging
      ? `
      background-color: transparent;
      border-color: transparent;
    `
      : ''}

  ${({ freezeFirstColumns }) =>
    freezeFirstColumns
      ? `@media (max-width: ${MOBILE_VIEWPORT}px) {
      width: ${RECORD_TABLE_TD_WIDTH};
      max-width: ${RECORD_TABLE_TD_WIDTH};
    }`
      : ''}
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
  const fontColor = theme.font.color.primary;

  return (
    <StyledTd
      isDragging={isDragging}
      backgroundColor={tdBackgroundColor}
      borderColor={borderColor}
      fontColor={fontColor}
      sticky={sticky}
      freezeFirstColumns={freezeFirstColumns}
      left={left}
      hasRightBorder={hasRightBorder}
      hasBottomBorder={hasBottomBorder}
      width={width}
      colSpan={colSpan}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
    >
      {children}
    </StyledTd>
  );
};
