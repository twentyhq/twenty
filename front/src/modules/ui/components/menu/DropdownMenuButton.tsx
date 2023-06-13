import styled from '@emotion/styled';

export const DropdownMenuButton = styled.div`
  --horizontal-padding: 6px;
  --vertical-padding: 9px;

  padding: var(--vertical-padding) var(--horizontal-padding);

  width: calc(100% - 2 * var(--horizontal-padding));
  height: calc(32px - 2 * var(--vertical-padding));

  display: flex;
  flex-direction: row;
  align-items: center;

  gap: 8px;

  border-radius: ${(props) => props.theme.borderRadius};

  cursor: pointer;

  user-select: none;

  transition: background 0.1s ease;
  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  color: ${(props) => props.theme.text60};
  font-size: ${(props) => props.theme.fontSizeSmall};
`;
