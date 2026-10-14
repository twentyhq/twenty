import { type OverflowingTextWithTooltipProps } from 'twenty-ui/primitives/typography';

export type FieldDisplayTooltipContextValue = {
  withTooltip: boolean;
  measureOverflowOnOpen: boolean;
  getInitialPointerPosition?: () => OverflowingTextWithTooltipProps['initialPointerPosition'];
};
