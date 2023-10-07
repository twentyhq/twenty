import styled from '@emotion/styled';

export const StyledDropdownMenu = styled.div<{
  disableBlur?: boolean;
  width?: `${string}px` | 'auto' | number;
}>`
  backdrop-filter: ${({ disableBlur }) =>
    disableBlur ? 'none' : 'blur(20px)'};

  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  display: flex;

  flex-direction: column;

  overflow: hidden;

  width: ${({ width }) =>
    width ? `${typeof width === 'number' ? `${width}px` : width}` : '160px'};
`;
