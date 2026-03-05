import { type CommandMenuItemConfig } from '@/action-menu/actions/types/CommandMenuItemConfig';
import { CommandMenuItemConfigContext } from '@/action-menu/contexts/CommandMenuItemConfigContext';

export const ActionComponent = ({ action }: { action: CommandMenuItemConfig }) => {
  return (
    <CommandMenuItemConfigContext.Provider value={action}>
      {action.component}
    </CommandMenuItemConfigContext.Provider>
  );
};
