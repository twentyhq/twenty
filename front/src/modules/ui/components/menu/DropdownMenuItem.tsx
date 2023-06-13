import styled from '@emotion/styled';

export const DropdownMenuItem = styled.div`
  --horizontal-padding: ${(props) => props.theme.spacing(1.5)};
  --vertical-padding: ${(props) => props.theme.spacing(2)};

  padding: var(--vertical-padding) var(--horizontal-padding);

  width: calc(100% - 2 * var(--horizontal-padding));
  height: calc(32px - 2 * var(--vertical-padding));

  display: flex;
  flex-direction: row;
  align-items: center;

  gap: ${(props) => props.theme.spacing(2)};

  border-radius: ${(props) => props.theme.borderRadius};

  color: ${(props) => props.theme.text60};
  font-size: ${(props) => props.theme.fontSizeSmall};
`;
