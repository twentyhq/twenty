import { useRunWorkflowRecordActions } from '@/command-menu-item/actions/record-actions/run-workflow-actions/hooks/useRunWorkflowRecordActions';
import { useRunWorkflowRecordAgnosticActions } from '@/command-menu-item/actions/record-agnostic-actions/run-workflow-actions/hooks/useRunWorkflowRecordAgnosticActions';
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
  actionMenuType,
  children,
}: {
  objectMetadataItem: ObjectMetadataItem;
  isInSidePanel: CommandMenuItemContextType['isInSidePanel'];
  displayType: CommandMenuItemContextType['displayType'];
  actionMenuType: CommandMenuItemContextType['actionMenuType'];
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

  const runWorkflowRecordActions = useRunWorkflowRecordActions({
    objectMetadataItem,
    skip: !isRecordSelection,
  });

  const runWorkflowRecordAgnosticActions =
    useRunWorkflowRecordAgnosticActions();

  const commandMenuItemContextApi = useCommandMenuItemContextApi();

  const commandMenuItemFrontComponentActions =
    useCommandMenuItemFrontComponentActions(commandMenuItemContextApi);

  return (
    <CommandMenuItemContext.Provider
      value={{
        isInSidePanel,
        displayType,
        actionMenuType,
        actions: [
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
