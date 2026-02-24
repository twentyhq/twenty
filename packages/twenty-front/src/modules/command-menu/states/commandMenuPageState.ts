import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { CommandMenuPages } from 'twenty-shared/types';

export const commandMenuPageState = createStateV2<CommandMenuPages>({
  key: 'command-menu/commandMenuPageState',
  defaultValue: CommandMenuPages.Root,
});
