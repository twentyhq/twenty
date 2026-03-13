import {
  CommandMenuContext,
  type CommandMenuContextType,
} from '@/command-menu-item/contexts/CommandMenuContext';
import { useCommandMenuItemFrontComponentCommands } from '@/command-menu-item/server-items/hooks/useCommandMenuItemFrontComponentCommands';
import { type CommandMenuContextApi } from 'twenty-shared/types';

type CommandMenuContextProviderServerItemsContentProps = {
  isInSidePanel: CommandMenuContextType['isInSidePanel'];
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  children: React.ReactNode;
};

export const CommandMenuContextProviderServerItemsContent = ({
  isInSidePanel,
  displayType,
  containerType,
  children,
  commandMenuContextApi,
}: CommandMenuContextProviderServerItemsContentProps & {
  commandMenuContextApi: CommandMenuContextApi;
}) => {
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
