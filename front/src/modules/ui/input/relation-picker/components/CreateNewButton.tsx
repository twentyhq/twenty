import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { MenuItem } from '@/ui/menu-item/components/MenuItem';

const StyledCreateNewButton = styled(MenuItem)<{ hovered: boolean }>`
  ${({ hovered, theme }) =>
    hovered &&
    css`
      background: ${theme.background.transparent.light};
    `}
`;

export const CreateNewButton = StyledCreateNewButton;
