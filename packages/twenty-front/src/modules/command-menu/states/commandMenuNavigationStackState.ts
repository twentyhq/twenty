import { type CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { type IconComponent } from 'twenty-ui/display';
import { createState } from '@/ui/utilities/state/utils/createState';

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
