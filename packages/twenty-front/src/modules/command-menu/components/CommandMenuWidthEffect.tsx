import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import {
  COMMAND_MENU_WIDTH_VAR,
  commandMenuWidthState,
} from '@/command-menu/states/commandMenuWidthState';

export const CommandMenuWidthEffect = () => {
  const commandMenuWidth = useRecoilValue(commandMenuWidthState);

  useEffect(() => {
    document.documentElement.style.setProperty(
      COMMAND_MENU_WIDTH_VAR,
      `${commandMenuWidth}px`,
    );
  }, [commandMenuWidth]);

  return null;
};
