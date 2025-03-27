import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { createState } from 'twenty-ui/utilities';

export const commandMenuPageState = createState<CommandMenuPages>({
  key: 'command-menu/commandMenuPageState',
  defaultValue: CommandMenuPages.Root,
});
