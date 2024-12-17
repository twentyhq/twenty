import styled from '@emotion/styled';

const StyledDropdownMenu = styled.div<{
  width?: `${string}px` | `${number}%` | 'auto' | number;
}>`
  display: flex;

  flex-direction: column;
  height: 100%;
  width: ${({ width = 200 }) =>
    typeof width === 'number' ? `${width}px` : width};
`;

export const DropdownMenu = StyledDropdownMenu;
