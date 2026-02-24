import { useRunWorkflowRecordActions } from '@/action-menu/actions/record-actions/run-workflow-actions/hooks/useRunWorkflowRecordActions';
import { useRunWorkflowRecordAgnosticActions } from '@/action-menu/actions/record-agnostic-actions/run-workflow-actions/hooks/useRunWorkflowRecordAgnosticActions';
import {
  ActionMenuContext,
  type ActionMenuContextType,
} from '@/action-menu/contexts/ActionMenuContext';
import { useRegisteredActions } from '@/action-menu/hooks/useRegisteredActions';
import { useShouldActionBeRegisteredParams } from '@/action-menu/hooks/useShouldActionBeRegisteredParams';
import { useCommandMenuItemFrontComponentActions } from '@/command-menu-item/hooks/useCommandMenuItemFrontComponentActions';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

export const ActionMenuContextProviderDefault = ({
  objectMetadataItem,
  isInRightDrawer,
  displayType,
  actionMenuType,
  children,
}: {
  objectMetadataItem: ObjectMetadataItem;
  isInRightDrawer: ActionMenuContextType['isInRightDrawer'];
  displayType: ActionMenuContextType['displayType'];
  actionMenuType: ActionMenuContextType['actionMenuType'];
  children: React.ReactNode;
}) => {
  const params = useShouldActionBeRegisteredParams({
    objectMetadataItem,
  });

  const shouldBeRegisteredParams = {
    ...params,
  };

  const actions = useRegisteredActions(shouldBeRegisteredParams);

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
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

  const commandMenuItemFrontComponentActions =
    useCommandMenuItemFrontComponentActions();

  return (
    <ActionMenuContext.Provider
      value={{
        isInRightDrawer,
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
    </ActionMenuContext.Provider>
  );
};
