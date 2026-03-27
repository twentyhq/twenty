import {
  CommandMenuContext,
  type CommandMenuContextType,
} from '@/command-menu-item/contexts/CommandMenuContext';
import { useCommandMenuItemsFromBackend } from '@/command-menu-item/server-items/common/hooks/useCommandMenuItemsFromBackend';
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
  const commandMenuItems = useCommandMenuItemsFromBackend(
    commandMenuContextApi,
  );

  return (
    <CommandMenuContext.Provider
      value={{
        isInSidePanel,
        displayType,
        containerType,
        commandMenuItems,
      }}
    >
      {children}
    </CommandMenuContext.Provider>
  );
};
