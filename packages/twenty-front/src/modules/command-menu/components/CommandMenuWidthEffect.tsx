import { useEffect } from 'react';

import {
  COMMAND_MENU_WIDTH_VAR,
  commandMenuWidthState,
} from '@/command-menu/states/commandMenuWidthState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const CommandMenuWidthEffect = () => {
  const commandMenuWidth = useAtomStateValue(commandMenuWidthState);

  useEffect(() => {
    document.documentElement.style.setProperty(
      COMMAND_MENU_WIDTH_VAR,
      `${commandMenuWidth}px`,
    );
  }, [commandMenuWidth]);

  return null;
};
