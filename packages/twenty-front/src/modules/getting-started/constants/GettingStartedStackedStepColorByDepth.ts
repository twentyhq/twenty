import { themeCssVariables } from 'twenty-ui/theme';

export const GETTING_STARTED_STACKED_STEP_COLOR_BY_DEPTH: Record<
  number,
  string
> = {
  1: themeCssVariables.font.color.primary,
  2: themeCssVariables.font.color.secondary,
  3: themeCssVariables.font.color.tertiary,
};
