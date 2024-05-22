import styled from '@emotion/styled';

const StyledDropdownMenu = styled.div<{
  disableBlur?: boolean;
  disableBorder?: boolean;
  width?: `${string}px` | `${number}%` | 'auto' | number;
}>`
  backdrop-filter: ${({ disableBlur }) =>
    disableBlur
      ? 'none'
      : 'blur(12px) saturate(200%) contrast(50%) brightness(130%)'};

  background: ${({ theme, disableBlur }) =>
    disableBlur
      ? theme.background.primary
      : theme.background.transparent.secondary};

  border: ${({ disableBorder, theme }) =>
    disableBorder ? 'none' : `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};

  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  display: flex;

  flex-direction: column;
  z-index: 1;
  width: ${({ width = 160 }) =>
    typeof width === 'number' ? `${width}px` : width};
`;

export const DropdownMenu = StyledDropdownMenu;
