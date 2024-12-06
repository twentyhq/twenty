import { useActivateWorkflowDraftWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowDraftWorkflowSingleRecordAction';
import { useActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction';
import { useDeactivateWorkflowWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDeactivateWorkflowWorkflowSingleRecordAction';
import { useDiscardDraftWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDiscardDraftWorkflowSingleRecordAction';
import { useSeeWorkflowActiveVersionWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowActiveVersionWorkflowSingleRecordAction';
import { useSeeWorkflowRunsWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowRunsWorkflowSingleRecordAction';
import { useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction';
import { useTestWorkflowWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useTestWorkflowWorkflowSingleRecordAction';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-ui';

export const useWorkflowSingleRecordActions = () => {
  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const selectedRecordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds?.[0]
      : undefined;

  if (!isDefined(selectedRecordId)) {
    throw new Error('Selected record ID is required');
  }

  const {
    registerTestWorkflowWorkflowSingleRecordAction,
    unregisterTestWorkflowWorkflowSingleRecordAction,
  } = useTestWorkflowWorkflowSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction,
    unregisterActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction,
  } = useActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerDeactivateWorkflowWorkflowSingleRecordAction,
    unregisterDeactivateWorkflowWorkflowSingleRecordAction,
  } = useDeactivateWorkflowWorkflowSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerSeeWorkflowRunsWorkflowSingleRecordAction,
    unregisterSeeWorkflowRunsWorkflowSingleRecordAction,
  } = useSeeWorkflowRunsWorkflowSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerSeeWorkflowVersionsHistoryWorkflowSingleRecordAction,
    unregisterSeeWorkflowVersionsHistoryWorkflowSingleRecordAction,
  } = useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerSeeWorkflowActiveVersionWorkflowSingleRecordAction,
    unregisterSeeWorkflowActiveVersionWorkflowSingleRecordAction,
  } = useSeeWorkflowActiveVersionWorkflowSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerActivateWorkflowDraftWorkflowSingleRecordAction,
    unregisterActivateWorkflowDraftWorkflowSingleRecordAction,
  } = useActivateWorkflowDraftWorkflowSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerDiscardDraftWorkflowSingleRecordAction,
    unregisterDiscardDraftWorkflowSingleRecordAction,
  } = useDiscardDraftWorkflowSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const registerSingleRecordActions = ({
    startPosition,
  }: {
    startPosition: number;
  }) => {
    registerTestWorkflowWorkflowSingleRecordAction({ position: startPosition });
    registerDiscardDraftWorkflowSingleRecordAction({
      position: startPosition + 1,
    });
    registerActivateWorkflowDraftWorkflowSingleRecordAction({
      position: startPosition + 2,
    });
    registerActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction({
      position: startPosition + 3,
    });
    registerDeactivateWorkflowWorkflowSingleRecordAction({
      position: startPosition + 4,
    });
    registerSeeWorkflowRunsWorkflowSingleRecordAction({
      position: startPosition + 5,
    });
    registerSeeWorkflowActiveVersionWorkflowSingleRecordAction({
      position: startPosition + 6,
    });
    registerSeeWorkflowVersionsHistoryWorkflowSingleRecordAction({
      position: startPosition + 7,
    });
  };

  const unregisterSingleRecordActions = () => {
    unregisterTestWorkflowWorkflowSingleRecordAction();
    unregisterActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction();
    unregisterDiscardDraftWorkflowSingleRecordAction();
    unregisterActivateWorkflowDraftWorkflowSingleRecordAction();
    unregisterDeactivateWorkflowWorkflowSingleRecordAction();
    unregisterSeeWorkflowRunsWorkflowSingleRecordAction();
    unregisterSeeWorkflowActiveVersionWorkflowSingleRecordAction();
    unregisterSeeWorkflowVersionsHistoryWorkflowSingleRecordAction();
  };

  return {
    registerSingleRecordActions,
    unregisterSingleRecordActions,
  };
};
