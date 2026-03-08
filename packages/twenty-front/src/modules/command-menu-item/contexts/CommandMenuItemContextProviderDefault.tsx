import { useRunWorkflowRecordCommands } from '@/command-menu-item/record/workflow/hooks/useRunWorkflowRecordCommands';
import { useRunWorkflowRecordAgnosticCommands } from '@/command-menu-item/record-agnostic/workflow/hooks/useRunWorkflowRecordAgnosticCommands';
import {
  CommandMenuItemContext,
  type CommandMenuItemContextType,
} from '@/command-menu-item/contexts/CommandMenuItemContext';
import { useRegisteredCommandMenuItems } from '@/command-menu-item/hooks/useRegisteredCommandMenuItems';
import { useShouldCommandMenuItemBeRegisteredParams } from '@/command-menu-item/hooks/useShouldCommandMenuItemBeRegisteredParams';
import { useCommandMenuItemContextApi } from '@/command-menu-item/hooks/useCommandMenuItemContextApi';
import { useCommandMenuItemFrontComponentActions } from '@/command-menu-item/hooks/useCommandMenuItemFrontComponentActions';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const CommandMenuItemContextProviderDefault = ({
  objectMetadataItem,
  isInSidePanel,
  displayType,
  containerType,
  children,
}: {
  objectMetadataItem: ObjectMetadataItem;
  isInSidePanel: CommandMenuItemContextType['isInSidePanel'];
  displayType: CommandMenuItemContextType['displayType'];
  containerType: CommandMenuItemContextType['containerType'];
  children: React.ReactNode;
}) => {
  const params = useShouldCommandMenuItemBeRegisteredParams({
    objectMetadataItem,
  });

  const shouldBeRegisteredParams = {
    ...params,
  };

  const actions = useRegisteredCommandMenuItems(shouldBeRegisteredParams);

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const isRecordSelection =
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length > 0;

  const runWorkflowRecordActions = useRunWorkflowRecordCommands({
    objectMetadataItem,
    skip: !isRecordSelection,
  });

  const runWorkflowRecordAgnosticActions =
    useRunWorkflowRecordAgnosticCommands();

  const commandMenuItemContextApi = useCommandMenuItemContextApi();

  const commandMenuItemFrontComponentActions =
    useCommandMenuItemFrontComponentActions(commandMenuItemContextApi);

  return (
    <CommandMenuItemContext.Provider
      value={{
        isInSidePanel,
        displayType,
        containerType,
        commandMenuItems: [
          ...actions,
          ...runWorkflowRecordActions,
          ...runWorkflowRecordAgnosticActions,
          ...commandMenuItemFrontComponentActions,
        ],
      }}
    >
      {children}
    </CommandMenuItemContext.Provider>
  );
};
