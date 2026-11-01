import { createContext } from 'react';

import { type PageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelTarget';

export const PageLayoutSidePanelTargetContext =
  createContext<PageLayoutSidePanelTarget | null>(null);
