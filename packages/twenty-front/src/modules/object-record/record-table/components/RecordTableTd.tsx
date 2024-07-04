import { ReactNode, useContext } from 'react';
import { styled } from '@linaria/react';
import { ThemeContext } from 'twenty-ui';

import { isDefined } from '~/utils/isDefined';

const StyledTd = styled.td<{
  zIndex?: number;
  backgroundColor: string;
  borderColor: string;
  isDragging?: boolean;
  fontColor: string;
}>`
  border-bottom: 1px solid ${({ borderColor }) => borderColor};
  color: ${({ fontColor }) => fontColor};
  border-right: 1px solid ${({ borderColor }) => borderColor};

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
`;

export const RecordTableTd = ({
  className,
  children,
  zIndex,
  isSelected,
  isDragging,
}: {
  className?: string;
  children?: ReactNode;
  zIndex?: number;
  isSelected?: boolean;
  isDragging?: boolean;
}) => {
  const { theme } = useContext(ThemeContext);

  const tdBackgroundColor = isSelected
    ? theme.accent.quaternary
    : theme.background.primary;

  const borderColor = theme.border.color.light;
  const fontColor = theme.font.color.primary;

  return (
    <StyledTd
      className={className}
      isDragging={isDragging}
      zIndex={zIndex}
      backgroundColor={tdBackgroundColor}
      borderColor={borderColor}
      fontColor={fontColor}
    >
      {children}
    </StyledTd>
  );
};
