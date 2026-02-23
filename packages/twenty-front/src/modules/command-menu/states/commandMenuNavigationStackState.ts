import { createState } from '@/ui/utilities/state/utils/createState';
import { type CommandMenuPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/display';

export type CommandMenuNavigationStackItem = {
  page: CommandMenuPages;
  pageTitle: string;
  pageIcon: IconComponent;
  pageIconColor?: string;
  pageId: string;
};

export const commandMenuNavigationStackState = createState<
  CommandMenuNavigationStackItem[]
>({
  key: 'command-menu/commandMenuNavigationStackState',
  defaultValue: [],
});
