import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { CommandMenuPages } from '@/command-menu/components/CommandMenuPages';
import { RightDrawerRecord } from '@/object-record/record-right-drawer/components/RightDrawerRecord';

export const COMMAND_MENU_PAGES_CONFIG = new Map<
  CommandMenuPages,
  React.ReactNode
>([
  [CommandMenuPages.Root, <CommandMenu />],
  [CommandMenuPages.ViewRecord, <RightDrawerRecord />],
]);
