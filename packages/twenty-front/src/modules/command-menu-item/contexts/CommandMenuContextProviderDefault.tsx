import {
  CommandMenuContext,
  type CommandMenuContextType,
} from '@/command-menu-item/contexts/CommandMenuContext';
import { useRegisteredCommandMenuItems } from '@/command-menu-item/hooks/useRegisteredCommandMenuItems';
import { useShouldCommandMenuItemBeRegisteredParams } from '@/command-menu-item/hooks/useShouldCommandMenuItemBeRegisteredParams';
import { useRunWorkflowRecordAgnosticCommands } from '@/command-menu-item/record-agnostic/workflow/hooks/useRunWorkflowRecordAgnosticCommands';
import { useRunWorkflowRecordCommands } from '@/command-menu-item/record/workflow/hooks/useRunWorkflowRecordCommands';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const CommandMenuContextProviderDefault = ({
  objectMetadataItem,
  isInSidePanel,
  displayType,
  containerType,
  children,
}: {
  objectMetadataItem: ObjectMetadataItem;
  isInSidePanel: CommandMenuContextType['isInSidePanel'];
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  children: React.ReactNode;
}) => {
  const shouldBeRegisteredParams = useShouldCommandMenuItemBeRegisteredParams({
    objectMetadataItem,
  });

  const commandMenuItems = useRegisteredCommandMenuItems(
    shouldBeRegisteredParams,
  );

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const isRecordSelection =
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length > 0;

  const runWorkflowRecordCommands = useRunWorkflowRecordCommands({
    objectMetadataItem,
    skip: !isRecordSelection,
  });

  const runWorkflowRecordAgnosticCommands =
    useRunWorkflowRecordAgnosticCommands();

  return (
    <CommandMenuContext.Provider
      value={{
        isInSidePanel,
        displayType,
        containerType,
        commandMenuItems: [
          ...commandMenuItems,
          ...runWorkflowRecordCommands,
          ...runWorkflowRecordAgnosticCommands,
        ],
      }}
    >
      {children}
    </CommandMenuContext.Provider>
  );
};
