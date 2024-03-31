import styled from '@emotion/styled';

const StyledDropdownMenu = styled.div<{
  disableBlur?: boolean;
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

  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};

  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  display: flex;

  flex-direction: column;
  z-index: 1;
  width: ${({ width }) =>
    width ? `${typeof width === 'number' ? `${width}px` : width}` : '160px'};
`;

export const DropdownMenu = StyledDropdownMenu;
