import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledDropdownMenu = styled.div<{
  width?: `${string}px` | `${number}%` | 'auto' | number;
  minWidth?: `${string}px` | `${number}%` | 'auto' | number;
  maxWidth?: `${string}px` | `${number}%` | 'auto' | number;
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
  min-width: ${({ minWidth }) =>
    isDefined(minWidth)
      ? typeof minWidth === 'number'
        ? `${minWidth}px`
        : minWidth
      : 'auto'};
  max-width: ${({ maxWidth }) =>
    isDefined(maxWidth)
      ? typeof maxWidth === 'number'
        ? `${maxWidth}px`
        : maxWidth
      : 'none'};
`;

export const DropdownMenu = StyledDropdownMenu;
