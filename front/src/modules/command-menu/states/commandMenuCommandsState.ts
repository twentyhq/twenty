import { atom } from 'recoil';

import { Command, CommandType } from '../types/Command';

export const commandMenuCommandsState = atom<Command[]>({
  key: 'command-menu/commandMenuCommandsState',
  default: [
    {
      to: '',
      label: '',
      type: CommandType.Navigate,
    },
  ],
});
