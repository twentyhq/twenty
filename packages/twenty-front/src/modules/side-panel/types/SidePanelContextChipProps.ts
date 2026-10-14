import { type ReactNode } from 'react';

import { type SidePanelNavigationStackItem } from '@/side-panel/states/sidePanelNavigationStackState';

export type SidePanelContextChipProps = {
  Icons: ReactNode[];
  text?: string;
  onClick?: () => void;
  testId?: string;
  maxWidth?: string;
  forceEmptyText?: boolean;
  page?: SidePanelNavigationStackItem;
};
