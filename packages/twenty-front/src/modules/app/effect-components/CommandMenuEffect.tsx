import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { COMMAND_MENU_COMMANDS } from '@/command-menu/constants/CommandMenuCommands';
import { commandMenuCommandsState } from '@/command-menu/states/commandMenuCommandsState';

export const CommandMenuEffect = () => {
  const setCommands = useSetRecoilState(commandMenuCommandsState);

  const commands = Object.values(COMMAND_MENU_COMMANDS);
  useEffect(() => {
    setCommands(commands);
  }, [commands, setCommands]);

  return <></>;
};
