import { CommandMenuItemConfigContext } from '@/command-menu-item/contexts/CommandMenuItemConfigContext';
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
  const actionConfig = useContext(CommandMenuItemConfigContext);

  const { closeCommandMenu } = useCloseCommandMenu({
    closeSidePanelOnShowPageOptionsActionExecution: false,
    closeSidePanelOnCommandMenuItemListActionExecution: false,
  });

  const isMounted = useAtomFamilySelectorValue(
    isHeadlessFrontComponentMountedFamilySelector,
    frontComponentId,
  );

  if (!actionConfig) {
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
