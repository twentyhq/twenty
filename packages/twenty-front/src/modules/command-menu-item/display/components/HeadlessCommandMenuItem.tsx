import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useContext } from 'react';

import { isDefined } from 'twenty-shared/utils';
import { CommandMenuItemDisplay } from './CommandMenuItemDisplay';

export const HeadlessCommandMenuItem = ({
  isMounted,
  commandMenuItemId,
  onClick,
}: {
  isMounted: boolean;
  commandMenuItemId: string;
  onClick: () => void;
}) => {
  const commandMenuItemConfig = useContext(CommandConfigContext);

  const { closeCommandMenu } = useCloseCommandMenu({
    closeSidePanelOnShowPageOptionsExecution: false,
    closeSidePanelOnCommandMenuListExecution: false,
  });

  const commandMenuItemProgress = useAtomFamilyStateValue(
    commandMenuItemProgressFamilyState,
    commandMenuItemId,
  );

  if (!isDefined(commandMenuItemConfig)) {
    return null;
  }

  const handleClick = () => {
    if (isMounted) {
      return;
    }

    closeCommandMenu();
    onClick();
  };

  return (
    <CommandMenuItemDisplay
      onClick={handleClick}
      disabled={isMounted}
      progress={commandMenuItemProgress}
      showDisabledLoader={isMounted}
    />
  );
};
