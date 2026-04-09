import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';

export const CommandMenuItemComponent = ({
  commandMenuItem,
}: {
  commandMenuItem: CommandMenuItemConfig;
}) => {
  return (
    <CommandConfigContext.Provider value={commandMenuItem}>
      {commandMenuItem.component}
    </CommandConfigContext.Provider>
  );
};
