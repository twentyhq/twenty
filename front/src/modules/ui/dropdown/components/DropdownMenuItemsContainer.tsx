/* eslint-disable twenty/styled-components-prefixed-with-styled */
import styled from '@emotion/styled';

export const DropdownMenuItemsContainer = styled.div<{
  hasMaxHeight?: boolean;
}>`
  --padding: ${({ theme }) => theme.spacing(1)};

  align-items: flex-start;
  display: flex;

  flex-direction: column;
  gap: 2px;
  height: 100%;
  max-height: ${({ hasMaxHeight }) => (hasMaxHeight ? '180px' : 'none')};
  overflow-y: auto;

  padding: var(--padding);
  width: calc(100% - 2 * var(--padding));
`;
