import {
  CommandMenuContext,
  type CommandMenuContextType,
} from '@/command-menu-item/contexts/CommandMenuContext';
import { useCommandMenuItemsFromBackend } from '@/command-menu-item/hooks/useCommandMenuItemsFromBackend';
import { type CommandMenuContextApi } from 'twenty-shared/types';

type CommandMenuContextProviderContentProps = {
  isInSidePanel: CommandMenuContextType['isInSidePanel'];
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  children: React.ReactNode;
};

export const CommandMenuContextProviderContent = ({
  isInSidePanel,
  displayType,
  containerType,
  children,
  commandMenuContextApi,
}: CommandMenuContextProviderContentProps & {
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
