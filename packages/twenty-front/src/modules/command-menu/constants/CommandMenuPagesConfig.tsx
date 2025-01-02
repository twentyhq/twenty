import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { CommandMenuPages } from '@/command-menu/components/CommandMenuPages';
import { CommandMenuShowPage } from '@/command-menu/components/CommandMenuShowPage';

export const COMMAND_MENU_PAGES_CONFIG = new Map<
  CommandMenuPages,
  React.ReactNode
>([
  [CommandMenuPages.Root, <CommandMenu />],
  [CommandMenuPages.ViewRecord, <CommandMenuShowPage />],
]);
