import { WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/single-record/workflow-actions/constants/WorkflowSingleRecordActionsConfig';
import { useActivateWorkflowDraftWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowDraftWorkflowSingleRecordAction';
import { useActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction';
import { useDeactivateWorkflowWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDeactivateWorkflowWorkflowSingleRecordAction';
import { useDiscardDraftWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDiscardDraftWorkflowSingleRecordAction';
import { useSeeWorkflowActiveVersionWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowActiveVersionWorkflowSingleRecordAction';
import { useSeeWorkflowRunsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowRunsWorkflowSingleRecordAction';
import { useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction';
import { useTestWorkflowWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useTestWorkflowWorkflowSingleRecordAction';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-ui';

export const useWorkflowSingleRecordActions = () => {
  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const { removeActionMenuEntry } = useActionMenuEntries();

  const selectedRecordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds?.[0]
      : undefined;

  if (!isDefined(selectedRecordId)) {
    throw new Error('Selected record ID is required');
  }

  const { registerTestWorkflowWorkflowSingleRecordAction } =
    useTestWorkflowWorkflowSingleRecordAction({
      workflowId: selectedRecordId,
    });

  const {
    registerActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction,
  } = useActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const { registerDeactivateWorkflowWorkflowSingleRecordAction } =
    useDeactivateWorkflowWorkflowSingleRecordAction({
      workflowId: selectedRecordId,
    });

  const { registerSeeWorkflowRunsWorkflowSingleRecordAction } =
    useSeeWorkflowRunsWorkflowSingleRecordAction({
      workflowId: selectedRecordId,
    });

  const { registerSeeWorkflowVersionsHistoryWorkflowSingleRecordAction } =
    useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction({
      workflowId: selectedRecordId,
    });

  const { registerSeeWorkflowActiveVersionWorkflowSingleRecordAction } =
    useSeeWorkflowActiveVersionWorkflowSingleRecordAction({
      workflowId: selectedRecordId,
    });

  const { registerActivateWorkflowDraftWorkflowSingleRecordAction } =
    useActivateWorkflowDraftWorkflowSingleRecordAction({
      workflowId: selectedRecordId,
    });

  const { registerDiscardDraftWorkflowSingleRecordAction } =
    useDiscardDraftWorkflowSingleRecordAction({
      workflowId: selectedRecordId,
    });

  const registerSingleRecordActions = () => {
    registerTestWorkflowWorkflowSingleRecordAction();
    registerDiscardDraftWorkflowSingleRecordAction();
    registerActivateWorkflowDraftWorkflowSingleRecordAction();
    registerActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction();
    registerDeactivateWorkflowWorkflowSingleRecordAction();
    registerSeeWorkflowRunsWorkflowSingleRecordAction();
    registerSeeWorkflowActiveVersionWorkflowSingleRecordAction();
    registerSeeWorkflowVersionsHistoryWorkflowSingleRecordAction();
  };

  const unregisterSingleRecordActions = () => {
    for (const action of Object.values(WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG)) {
      removeActionMenuEntry(action.key);
    }
  };

  return {
    registerSingleRecordActions,
    unregisterSingleRecordActions,
  };
};
