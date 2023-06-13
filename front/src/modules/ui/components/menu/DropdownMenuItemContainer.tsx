import styled from '@emotion/styled';

export const DropdownMenuItemContainer = styled.div`
  --padding: ${(props) => props.theme.spacing(1 / 2)};

  width: calc(100% - 2 * var(--padding));
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--padding);
  gap: 2px;
`;
