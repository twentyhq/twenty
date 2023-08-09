import { atom } from 'recoil';

import { Command, CommandType } from '../types/Command';

export const commandMenuCommand = atom<Command[]>({
  key: 'command-menu/commandMenuCommand',
  default: [
    {
      to: '',
      label: '',
      type: CommandType.Navigate,
    },
  ],
});
