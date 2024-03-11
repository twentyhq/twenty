import { createState } from '@/ui/utilities/state/utils/createState';

import { Command, CommandType } from '../types/Command';

export const commandMenuCommandsState = createState<Command[]>({
  key: 'command-menu/commandMenuCommandsState',
  defaultValue: [
    {
      id: '',
      to: '',
      label: '',
      type: CommandType.Navigate,
    },
  ],
});
