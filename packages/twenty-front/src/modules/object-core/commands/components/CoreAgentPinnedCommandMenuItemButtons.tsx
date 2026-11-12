import { useContext } from 'react';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';

export const CoreAgentPinnedCommandMenuItemButtons = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  if (!commandMenuItems.some((commandMenuItem) => commandMenuItem.isPinned)) {
    return null;
  }

  return (
    <PinnedCommandMenuItemButtons containerWidth={Number.POSITIVE_INFINITY} />
  );
};
