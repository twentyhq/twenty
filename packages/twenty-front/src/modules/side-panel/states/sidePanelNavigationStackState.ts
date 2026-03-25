import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type SidePanelPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/display';

export type SidePanelNavigationStackItem = {
  page: SidePanelPages;
  pageTitle: string;
  pageIcon: IconComponent;
  pageIconColor?: string;
  pageId: string;
};

export const sidePanelNavigationStackState = createAtomState<
  SidePanelNavigationStackItem[]
>({
  key: 'side-panel/sidePanelNavigationStackState',
  defaultValue: [],
});
