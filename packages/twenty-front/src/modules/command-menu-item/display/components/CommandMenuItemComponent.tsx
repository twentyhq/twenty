import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemConfigContext } from '@/command-menu-item/contexts/CommandMenuItemConfigContext';

export const CommandMenuItemComponent = ({ action }: { action: CommandMenuItemConfig }) => {
  return (
    <CommandMenuItemConfigContext.Provider value={action}>
      {action.component}
    </CommandMenuItemConfigContext.Provider>
  );
};
