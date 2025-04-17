import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledDropdownMenu = styled.div<{
  width?: `${string}px` | `${number}%` | 'auto' | number;
}>`
  display: flex;

  flex-direction: column;
  height: 100%;
  width: ${({ width }) =>
    isDefined(width)
      ? typeof width === 'number'
        ? `${width}px`
        : width
      : 'auto'};
`;

export const DropdownMenu = StyledDropdownMenu;
