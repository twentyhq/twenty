import styled from '@emotion/styled';

export const DropdownMenuItemContainer = styled.div`
  --padding: ${(props) => props.theme.spacing(1 / 2)};

  align-items: flex-start;
  display: flex;

  flex-direction: column;
  gap: 2px;
  height: 100%;
  padding: var(--padding);
  width: calc(100% - 2 * var(--padding));
`;
