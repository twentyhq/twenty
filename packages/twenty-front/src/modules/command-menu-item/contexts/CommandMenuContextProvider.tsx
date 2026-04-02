import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProviderServerItems } from '@/command-menu-item/server-items/common/contexts/CommandMenuContextProviderServerItems';

export const CommandMenuContextProvider = ({
  children,
  isInSidePanel,
  displayType,
  containerType,
}: Omit<CommandMenuContextType, 'commandMenuItems'> & {
  children: React.ReactNode;
}) => {
  return (
    <CommandMenuContextProviderServerItems
      isInSidePanel={isInSidePanel}
      displayType={displayType}
      containerType={containerType}
    >
      {children}
    </CommandMenuContextProviderServerItems>
  );
};
