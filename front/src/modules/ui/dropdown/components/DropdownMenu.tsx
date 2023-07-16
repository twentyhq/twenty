import styled from '@emotion/styled';

export const DropdownMenu = styled.div<{ disableBlur?: boolean }>`
  align-items: center;
  backdrop-filter: ${({ disableBlur }) =>
    disableBlur ? 'none' : 'blur(20px)'};

  background: ${({ theme }) => theme.background.transparent.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};

  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  display: flex;

  flex-direction: column;

  width: 200px;
`;
