import styled from '@emotion/styled';

export const DropdownMenuItem = styled.div`
  --horizontal-padding: ${(props) => props.theme.spacing(1.5)};
  --vertical-padding: ${(props) => props.theme.spacing(2)};

  align-items: center;

  border-radius: ${(props) => props.theme.borderRadius};
  color: ${(props) => props.theme.text60};

  display: flex;
  flex-direction: row;
  font-size: ${(props) => props.theme.fontSizeSmall};

  gap: ${(props) => props.theme.spacing(2)};

  height: calc(32px - 2 * var(--vertical-padding));

  padding: var(--vertical-padding) var(--horizontal-padding);
  width: calc(100% - 2 * var(--horizontal-padding));
`;
