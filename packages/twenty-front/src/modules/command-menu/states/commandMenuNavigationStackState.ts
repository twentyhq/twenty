import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { type CommandMenuPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/display';

export type CommandMenuNavigationStackItem = {
  page: CommandMenuPages;
  pageTitle: string;
  pageIcon: IconComponent;
  pageIconColor?: string;
  pageId: string;
};

export const commandMenuNavigationStackState = createStateV2<
  CommandMenuNavigationStackItem[]
>({
  key: 'command-menu/commandMenuNavigationStackState',
  defaultValue: [],
});
