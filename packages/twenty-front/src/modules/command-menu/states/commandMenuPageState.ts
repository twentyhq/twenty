import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { createState } from '@/ui/utilities/state/utils/createState';

export const commandMenuPageState = createState<CommandMenuPages>({
  key: 'command-menu/commandMenuPageState',
  defaultValue: CommandMenuPages.Root,
});
