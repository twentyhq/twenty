import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { createState } from 'twenty-ui';

export const commandMenuPageState = createState<CommandMenuPages>({
  key: 'command-menu/commandMenuPageState',
  defaultValue: CommandMenuPages.Root,
});
