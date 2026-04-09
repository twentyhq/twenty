import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';

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
