import { css } from '@emotion/react';

export const HOVER_BACKGROUND = (props: any) => css`
  transition: background 0.1s ease;
  &:hover {
    background: ${props.theme.background.transparent.light};
  }
`;
