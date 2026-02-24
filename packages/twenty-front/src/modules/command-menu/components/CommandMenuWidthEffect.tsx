import { useEffect } from 'react';

import {
  COMMAND_MENU_WIDTH_VAR,
  commandMenuWidthState,
} from '@/command-menu/states/commandMenuWidthState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const CommandMenuWidthEffect = () => {
  const commandMenuWidth = useRecoilValueV2(commandMenuWidthState);

  useEffect(() => {
    document.documentElement.style.setProperty(
      COMMAND_MENU_WIDTH_VAR,
      `${commandMenuWidth}px`,
    );
  }, [commandMenuWidth]);

  return null;
};
