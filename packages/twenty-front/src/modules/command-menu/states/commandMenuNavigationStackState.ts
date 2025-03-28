import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { createState } from 'twenty-ui/utilities';
import { IconComponent } from 'twenty-ui/display';

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
