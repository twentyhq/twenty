import { useActivateWorkflowDraftSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowDraftSingleRecordAction';
import { useActivateWorkflowLastPublishedVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowLastPublishedVersionSingleRecordAction';
import { useDeactivateWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDeactivateWorkflowSingleRecordAction';
import { useDiscardWorkflowDraftSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDiscardWorkflowDraftSingleRecordAction';
import { useSeeWorkflowActiveVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowActiveVersionSingleRecordAction';
import { useSeeWorkflowExecutionsSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowExecutionsSingleRecordAction';
import { useSeeWorkflowVersionsHistorySingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowVersionsHistorySingleRecordAction';
import { useTestWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useTestWorkflowSingleRecordAction';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-ui';

export const useWorkflowSingleRecordActions = () => {
  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const selectedRecordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  if (!isDefined(selectedRecordId)) {
    throw new Error('Selected record ID is required');
  }

  const {
    registerTestWorkflowSingleRecordAction,
    unregisterTestWorkflowSingleRecordAction,
  } = useTestWorkflowSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerActivateWorkflowLastPublishedVersionSingleRecordAction,
    unregisterActivateWorkflowLastPublishedVersionSingleRecordAction,
  } = useActivateWorkflowLastPublishedVersionSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerDeactivateWorkflowSingleRecordAction,
    unregisterDeactivateWorkflowSingleRecordAction,
  } = useDeactivateWorkflowSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerSeeWorkflowExecutionsSingleRecordAction,
    unregisterSeeWorkflowExecutionsSingleRecordAction,
  } = useSeeWorkflowExecutionsSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerSeeWorkflowVersionsHistorySingleRecordAction,
    unregisterSeeWorkflowVersionsHistorySingleRecordAction,
  } = useSeeWorkflowVersionsHistorySingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerSeeWorkflowActiveVersionSingleRecordAction,
    unregisterSeeWorkflowActiveVersionSingleRecordAction,
  } = useSeeWorkflowActiveVersionSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerActivateWorkflowDraftSingleRecordAction,
    unregisterActivateWorkflowDraftSingleRecordAction,
  } = useActivateWorkflowDraftSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const {
    registerDiscardWorkflowDraftSingleRecordAction,
    unregisterDiscardWorkflowDraftSingleRecordAction,
  } = useDiscardWorkflowDraftSingleRecordAction({
    workflowId: selectedRecordId,
  });

  const registerSingleRecordActions = ({
    startPosition = 3,
  }: {
    startPosition?: number;
  }) => {
    registerTestWorkflowSingleRecordAction({ position: startPosition });
    registerDiscardWorkflowDraftSingleRecordAction({
      position: startPosition + 1,
    });
    registerActivateWorkflowDraftSingleRecordAction({
      position: startPosition + 2,
    });
    registerActivateWorkflowLastPublishedVersionSingleRecordAction({
      position: startPosition + 3,
    });
    registerDeactivateWorkflowSingleRecordAction({
      position: startPosition + 4,
    });
    registerSeeWorkflowExecutionsSingleRecordAction({
      position: startPosition + 5,
    });
    registerSeeWorkflowActiveVersionSingleRecordAction({
      position: startPosition + 6,
    });
    registerSeeWorkflowVersionsHistorySingleRecordAction({
      position: startPosition + 7,
    });
  };

  const unregisterSingleRecordActions = () => {
    unregisterTestWorkflowSingleRecordAction();
    unregisterActivateWorkflowLastPublishedVersionSingleRecordAction();
    unregisterDiscardWorkflowDraftSingleRecordAction();
    unregisterActivateWorkflowDraftSingleRecordAction();
    unregisterDeactivateWorkflowSingleRecordAction();
    unregisterSeeWorkflowExecutionsSingleRecordAction();
    unregisterSeeWorkflowActiveVersionSingleRecordAction();
    unregisterSeeWorkflowVersionsHistorySingleRecordAction();
  };

  return {
    registerSingleRecordActions,
    unregisterSingleRecordActions,
  };
};
