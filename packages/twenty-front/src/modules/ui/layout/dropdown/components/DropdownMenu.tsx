import styled from '@emotion/styled';

const StyledDropdownMenu = styled.div<{
  disableBlur?: boolean;
  disableBorder?: boolean;
  width?: `${string}px` | `${number}%` | 'auto' | number;
}>`
  backdrop-filter: ${({ theme, disableBlur }) =>
    disableBlur ? 'none' : theme.blur.medium};

  color: ${({ theme }) => theme.font.color.secondary};

  background: ${({ theme, disableBlur }) =>
    disableBlur
      ? theme.background.primary
      : theme.background.transparent.primary};

  border: ${({ disableBorder, theme }) =>
    disableBorder ? 'none' : `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  display: flex;

  flex-direction: column;
  z-index: 30;
  width: ${({ width = 200 }) =>
    typeof width === 'number' ? `${width}px` : width};
`;

export const DropdownMenu = StyledDropdownMenu;
