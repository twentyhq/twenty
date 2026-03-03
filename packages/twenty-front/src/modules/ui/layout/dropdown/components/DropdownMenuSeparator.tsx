import { styled } from '@linaria/react';
import { useContext, type CSSProperties } from 'react';
import { ThemeContext } from 'twenty-ui/theme';

const StyledDropdownMenuSeparatorBase = styled.div`
  background-color: var(--separator-bg);
  min-height: 1px;
  width: 100%;
`;

export const DropdownMenuSeparator = ({
  className,
}: {
  className?: string;
}) => {
  const { theme } = useContext(ThemeContext);
  const bgColor =
    theme.name === 'dark'
      ? theme.background.transparent.light
      : theme.border.color.light;

  return (
    <StyledDropdownMenuSeparatorBase
      className={className}
      style={{ '--separator-bg': bgColor } as CSSProperties}
    />
  );
};
