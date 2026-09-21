import { type RefCallback } from 'react';
import { type TabsTabProps } from 'twenty-ui/primitives/navigation';

import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

export type TabListItemProps = Pick<
  TabsTabProps,
  'onMouseEnter' | 'onMouseLeave'
> & {
  tab: SingleTabProps;
  active: boolean;
  disabled?: boolean;
  onSelect?: (tabId: string) => void;
  ref?: RefCallback<HTMLElement>;
  'data-dnd-sortable-handle'?: boolean;
} & (
    | { mode: 'tab'; highlighted?: boolean }
    | { mode: 'link'; highlighted?: never }
  );
