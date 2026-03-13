import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';

export const CommandMenuItemComponent = ({
  action,
}: {
  action: CommandMenuItemConfig;
}) => {
  return (
    <CommandConfigContext.Provider value={action}>
      {action.component}
    </CommandConfigContext.Provider>
  );
};
