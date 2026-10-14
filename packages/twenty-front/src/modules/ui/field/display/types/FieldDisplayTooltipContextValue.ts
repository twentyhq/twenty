import { type OverflowingTextWithTooltipProps } from 'twenty-ui/primitives/typography';

export type FieldDisplayTooltipContextValue = {
  withTooltip: boolean;
  getInitialPointerPosition?: () => OverflowingTextWithTooltipProps['initialPointerPosition'];
};
