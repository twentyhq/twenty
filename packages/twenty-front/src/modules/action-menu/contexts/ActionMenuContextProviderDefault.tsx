import { useRunWorkflowRecordActions } from '@/action-menu/actions/record-actions/run-workflow-actions/hooks/useRunWorkflowRecordActions';
import { useRunWorkflowRecordAgnosticActions } from '@/action-menu/actions/record-agnostic-actions/run-workflow-actions/hooks/useRunWorkflowRecordAgnosticActions';
import {
  ActionMenuContext,
  type ActionMenuContextType,
} from '@/action-menu/contexts/ActionMenuContext';
import { useRegisteredActions } from '@/action-menu/hooks/useRegisteredActions';
import { useShouldActionBeRegisteredParams } from '@/action-menu/hooks/useShouldActionBeRegisteredParams';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { getSelectedRecordIdsFromTargetedRecordsRule } from '@/context-store/utils/getSelectedRecordIdsFromTargetedRecordsRule';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';

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

  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const { recordIndexId } = useRecordIndexIdFromCurrentContextStore();

  const allRecordIds = useRecoilValue(
    recordIndexAllRecordIdsComponentSelector.selectorFamily({
      instanceId: recordIndexId,
    }),
  );

  const actualSelectedRecordIds = getSelectedRecordIdsFromTargetedRecordsRule(
    contextStoreTargetedRecordsRule,
    allRecordIds,
  );

  const isRecordSelection = actualSelectedRecordIds.length > 0;

  const runWorkflowRecordActions = useRunWorkflowRecordActions({
    objectMetadataItem,
    skip: !isRecordSelection,
  });

  const runWorkflowRecordAgnosticActions =
    useRunWorkflowRecordAgnosticActions();

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
        ],
      }}
    >
      {children}
    </ActionMenuContext.Provider>
  );
};
