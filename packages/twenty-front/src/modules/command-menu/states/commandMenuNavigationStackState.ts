import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type SidePanelPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/display';

export type CommandMenuNavigationStackItem = {
  page: SidePanelPages;
  pageTitle: string;
  pageIcon: IconComponent;
  pageIconColor?: string;
  pageId: string;
};

export const commandMenuNavigationStackState = createAtomState<
  CommandMenuNavigationStackItem[]
>({
  key: 'command-menu/commandMenuNavigationStackState',
  defaultValue: [],
});
