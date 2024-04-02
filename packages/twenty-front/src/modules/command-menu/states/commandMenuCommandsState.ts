import { createState } from 'twenty-ui';

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
