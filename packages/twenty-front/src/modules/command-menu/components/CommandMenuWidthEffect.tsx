import { useEffect } from 'react';

import {
  COMMAND_MENU_WIDTH_VAR,
  commandMenuWidthState,
} from '@/command-menu/states/commandMenuWidthState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const CommandMenuWidthEffect = () => {
  const commandMenuWidth = useAtomValue(commandMenuWidthState);

  useEffect(() => {
    document.documentElement.style.setProperty(
      COMMAND_MENU_WIDTH_VAR,
      `${commandMenuWidth}px`,
    );
  }, [commandMenuWidth]);

  return null;
};
