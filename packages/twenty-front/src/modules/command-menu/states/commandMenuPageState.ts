import { CommandMenuPages } from '@/command-menu/components/CommandMenuPages';
import { createState } from 'twenty-ui';

export const commandMenuPageState = createState<CommandMenuPages>({
  key: 'command-menu/commandMenuPageState',
  defaultValue: CommandMenuPages.Root,
});
