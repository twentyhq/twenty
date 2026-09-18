import { css } from '@linaria/core';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const BUTTON_INVERTED_CLASS_NAME = css`
  &[data-variant='outline'],
  &[data-variant='ghost'] {
    --tw-button-active: ${themeCssVariables.background.transparent.medium};
    --tw-button-background: transparent;
    --tw-button-color: ${themeCssVariables.font.color.inverted};
    --tw-button-hover: ${themeCssVariables.background.transparent.light};
  }

  &[data-variant='outline'] {
    --tw-button-border: ${themeCssVariables.background.transparent.primary};
  }
`;
