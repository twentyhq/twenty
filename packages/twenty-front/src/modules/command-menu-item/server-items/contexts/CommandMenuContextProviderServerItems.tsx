import {
  CommandMenuContext,
  type CommandMenuContextType,
} from '@/command-menu-item/contexts/CommandMenuContext';
import { useCommandMenuContextApi } from '@/command-menu-item/server-items/hooks/useCommandMenuContextApi';
import { useCommandMenuItemFrontComponentCommands } from '@/command-menu-item/server-items/hooks/useCommandMenuItemFrontComponentCommands';

export const CommandMenuContextProviderServerItems = ({
  isInSidePanel,
  displayType,
  containerType,
  children,
}: {
  isInSidePanel: CommandMenuContextType['isInSidePanel'];
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  children: React.ReactNode;
}) => {
  const commandMenuContextApi = useCommandMenuContextApi();

  const commandMenuItemFrontComponentActions =
    useCommandMenuItemFrontComponentCommands(commandMenuContextApi);

  return (
    <CommandMenuContext.Provider
      value={{
        isInSidePanel,
        displayType,
        containerType,
        commandMenuItems: commandMenuItemFrontComponentActions,
      }}
    >
      {children}
    </CommandMenuContext.Provider>
  );
};
