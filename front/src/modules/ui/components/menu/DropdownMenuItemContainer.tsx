import styled from '@emotion/styled';

export const DropdownMenuItemContainer = styled.div`
  --padding: 2px;

  width: calc(100% - 2 * var(--padding));
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--padding);
  gap: 2px;
`;
