import { css } from '@linaria/core';
import { themeCssVariables } from 'twenty-ui/theme';

export const CARD_ACTION_CLASS_NAME = css`
  background: transparent;
  border: none;
  cursor: pointer;
  inset: 0;
  padding: 0;
  position: absolute;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -2px;
  }
`;
