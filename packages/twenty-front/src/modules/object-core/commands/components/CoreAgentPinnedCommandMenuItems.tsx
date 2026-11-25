import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { type CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { CoreAgentPinnedCommandMenuItemButtons } from '@/object-core/commands/components/CoreAgentPinnedCommandMenuItemButtons';

type CoreAgentPinnedCommandMenuItemsProps = {
  commandMenuInstanceId: string;
  containerType:
    | CommandMenuItemContainerType.IndexPageHeader
    | CommandMenuItemContainerType.ShowPageHeader;
};

export const CoreAgentPinnedCommandMenuItems = ({
  commandMenuInstanceId,
  containerType,
}: CoreAgentPinnedCommandMenuItemsProps) => (
  <CommandMenuComponentInstanceContext.Provider
    value={{ instanceId: commandMenuInstanceId }}
  >
    <CommandMenuContextProvider
      displayType="button"
      containerType={containerType}
    >
      <CoreAgentPinnedCommandMenuItemButtons />
    </CommandMenuContextProvider>
  </CommandMenuComponentInstanceContext.Provider>
);
