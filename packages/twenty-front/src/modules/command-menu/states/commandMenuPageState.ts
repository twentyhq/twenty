import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { CommandMenuPages } from 'twenty-shared/types';

export const commandMenuPageState = createAtomState<CommandMenuPages>({
  key: 'command-menu/commandMenuPageState',
  defaultValue: CommandMenuPages.Root,
});
