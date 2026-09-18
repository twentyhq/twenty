import { type ReactNode } from 'react';

import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';

export type TabListProps = {
  'aria-label': string;
  tabs: SingleTabProps[];
  loading?: boolean;
  behaveAsLinks?: boolean;
  className?: string;
  componentInstanceId: string;
  onChangeTab?: (tabId: string) => void;
  rightComponent?: ReactNode;
  centerTabs?: boolean;
  // Scroll the tabs instead of collapsing the ones that do not fit into a
  // "+N More" dropdown. For a narrow pane, where the dropdown can swallow most
  // of the row over a pixel or two, and a longer translation can swallow the
  // rest.
  alwaysScrollTabs?: boolean;
};
