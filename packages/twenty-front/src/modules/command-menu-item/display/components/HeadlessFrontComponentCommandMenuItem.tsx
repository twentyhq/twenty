import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { isHeadlessFrontComponentMountedFamilySelector } from '@/front-components/selectors/isHeadlessFrontComponentMountedFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useContext } from 'react';

import { CommandMenuItemDisplay } from './CommandMenuItemDisplay';

export const HeadlessFrontComponentCommandMenuItem = ({
  frontComponentId,
  onClick,
}: {
  frontComponentId: string;
  onClick: () => void;
}) => {
  const commandMenuItemConfig = useContext(CommandConfigContext);

  const { closeCommandMenu } = useCloseCommandMenu({
    closeSidePanelOnShowPageOptionsExecution: false,
    closeSidePanelOnCommandMenuListExecution: false,
  });

  const isMounted = useAtomFamilySelectorValue(
    isHeadlessFrontComponentMountedFamilySelector,
    frontComponentId,
  );

  if (!commandMenuItemConfig) {
    return null;
  }

  const handleClick = () => {
    if (isMounted) {
      return;
    }

    closeCommandMenu();
    onClick();
  };

  return <CommandMenuItemDisplay onClick={handleClick} disabled={isMounted} />;
};
