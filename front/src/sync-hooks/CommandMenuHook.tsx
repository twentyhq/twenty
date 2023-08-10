import { useSetRecoilState } from 'recoil';

import { commandMenuCommands } from '@/command-menu/constants/commandMenuCommands';
import { commandMenuCommand } from '@/command-menu/states/commandMenuCommandsState';

export function CommandMenuHook() {
  const setCommands = useSetRecoilState(commandMenuCommand);

  const commands = commandMenuCommands;
  setCommands(commands);

  return <></>;
}
