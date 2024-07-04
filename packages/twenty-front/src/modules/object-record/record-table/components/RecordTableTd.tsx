import { ReactNode, useContext } from 'react';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { MOBILE_VIEWPORT, ThemeContext } from 'twenty-ui';

import { isDefined } from '~/utils/isDefined';

const StyledTd = styled.td<{
  zIndex?: number;
  backgroundColor: string;
  borderColor: string;
  isDragging?: boolean;
  fontColor: string;
  sticky?: boolean;
  freezeFirstColumns?: boolean;
  left?: number;
}>`
  border-bottom: 1px solid ${({ borderColor }) => borderColor};
  color: ${({ fontColor }) => fontColor};
  border-right: 1px solid ${({ borderColor }) => borderColor};

  position: ${({ sticky }) => (sticky === true ? 'sticky' : 'relative')};
  left: ${({ left }) => (isDefined(left) ? `${left}px` : 'auto')};

  padding: 0;

  text-align: left;

  background: ${({ backgroundColor }) => backgroundColor};
  z-index: ${({ zIndex }) => (isDefined(zIndex) ? zIndex : 'auto')};

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
      width: 35px;
      max-width: 35px;
    }`
      : ''}
`;

export const RecordTableTd = ({
  children,
  zIndex,
  isSelected,
  isDragging,
  sticky,
  freezeFirstColumns,
  left,
  ...dragHandleProps
}: {
  children?: ReactNode;
  zIndex?: number;
  isSelected?: boolean;
  isDragging?: boolean;
  sticky?: boolean;
  freezeFirstColumns?: boolean;
  left?: number;
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
      zIndex={zIndex}
      backgroundColor={tdBackgroundColor}
      borderColor={borderColor}
      fontColor={fontColor}
      sticky={sticky}
      freezeFirstColumns={freezeFirstColumns}
      left={left}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
    >
      {children}
    </StyledTd>
  );
};
