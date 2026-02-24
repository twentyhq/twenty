import { createState } from '@/ui/utilities/state/jotai/utils/createState';
import { CommandMenuPages } from 'twenty-shared/types';

export const commandMenuPageState = createState<CommandMenuPages>({
  key: 'command-menu/commandMenuPageState',
  defaultValue: CommandMenuPages.Root,
});
