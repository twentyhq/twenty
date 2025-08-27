import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { MenuItem } from 'twenty-ui/navigation';

const StyledCreateNewButton = styled(MenuItem)<{ hovered?: boolean }>`
  ${({ hovered, theme }) =>
    hovered &&
    css`
      background: ${theme.background.transparent.light};
    `}
`;

export const CreateNewButton = StyledCreateNewButton;
