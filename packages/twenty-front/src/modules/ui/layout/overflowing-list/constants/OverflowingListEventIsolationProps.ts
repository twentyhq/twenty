import { type ComponentProps } from 'react';
import { type OverflowingList } from 'twenty-ui/components/layout';

export const OVERFLOWING_LIST_EVENT_ISOLATION_PROPS = {
  triggerProps: {
    onClick: (event) => event.stopPropagation(),
    onKeyDown: (event) => event.stopPropagation(),
  },
  popupProps: {
    onClick: (event) => event.stopPropagation(),
    onKeyDown: (event) => event.stopPropagation(),
  },
} satisfies Pick<
  ComponentProps<typeof OverflowingList>,
  'triggerProps' | 'popupProps'
>;
