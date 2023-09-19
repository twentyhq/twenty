import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { MenuItem } from '@/ui/menu-item/components/MenuItem';

export const StyledCreateNewButton = styled(MenuItem)<{ hovered: boolean }>`
  ${({ hovered, theme }) =>
    hovered &&
    css`
      background: ${theme.background.transparent.light};
    `}
`;
