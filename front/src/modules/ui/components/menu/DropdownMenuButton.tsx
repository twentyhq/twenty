import styled from '@emotion/styled';

import { hoverBackground } from '@/ui/layout/styles/themes';

export const DropdownMenuButton = styled.div`
  --horizontal-padding: ${(props) => props.theme.spacing(1.5)};
  --vertical-padding: ${(props) => props.theme.spacing(2)};

  align-items: center;

  border-radius: ${(props) => props.theme.borderRadius};
  color: ${(props) => props.theme.text60};

  cursor: pointer;
  display: flex;
  flex-direction: row;

  font-size: ${(props) => props.theme.fontSizeSmall};

  gap: ${(props) => props.theme.spacing(2)};

  height: calc(32px - 2 * var(--vertical-padding));

  padding: var(--vertical-padding) var(--horizontal-padding);

  ${hoverBackground};

  user-select: none;
  width: calc(100% - 2 * var(--horizontal-padding));
`;
