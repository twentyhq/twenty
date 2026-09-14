import { css } from '@linaria/core';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const BUTTON_ACTION_CLASS_NAME = css`
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding-inline: ${themeCssVariables.spacing[3]};
`;
