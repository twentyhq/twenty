import { atom } from 'recoil';

import { Command, CommandType } from '../types/Command';

export const commandMenuCommandsState = atom<Command[]>({
  key: 'command-menu/commandMenuCommandsState',
  default: [
    {
      id: '',
      to: '',
      label: '',
      type: CommandType.Navigate,
    },
  ],
});
