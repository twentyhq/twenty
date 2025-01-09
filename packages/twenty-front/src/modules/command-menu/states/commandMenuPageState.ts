import { CommandMenuPages } from '@/command-menu/components/CommandMenuPages';
import { createState } from '@ui/utilities/state/utils/createState';

export const commandMenuPageState = createState<CommandMenuPages>({
  key: 'command-menu/commandMenuPageState',
  defaultValue: CommandMenuPages.Root,
});
