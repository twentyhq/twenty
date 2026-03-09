import {
  CommandMenuContext,
  type CommandMenuContextType,
} from '@/command-menu-item/contexts/CommandMenuContext';
import { useCommandMenuContextApi } from '@/command-menu-item/hooks/useCommandMenuContextApi';
import { useCommandMenuItemFrontComponentActions } from '@/command-menu-item/hooks/useCommandMenuItemFrontComponentActions';

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
    useCommandMenuItemFrontComponentActions(commandMenuContextApi);

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
