import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { commandMenuCommands } from '@/command-menu/constants/commandMenuCommands';
import { commandMenuCommandsState } from '@/command-menu/states/commandMenuCommandsState';

export const CommandMenuEffect = () => {
  const setCommands = useSetRecoilState(commandMenuCommandsState);

  const commands = commandMenuCommands;
  useEffect(() => {
    setCommands(commands);
  }, [commands, setCommands]);

  return <></>;
};
