import { useDeleteSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useDeleteSingleRecordAction';
import { useManageFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useManageFavoritesSingleRecordAction';
import { useActivateWorkflowDraftSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowDraftSingleRecordAction';
import { useActivateWorkflowLastPublishedVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowLastPublishedVersionSingleRecordAction';
import { useDeactivateWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDeactivateWorkflowSingleRecordAction';
import { useDiscardWorkflowDraftSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDiscardWorkflowDraftSingleRecordAction';
import { useSeeWorkflowActiveVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowActiveVersionSingleRecordAction';
import { useSeeWorkflowExecutionsSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowExecutionsSingleRecordAction';
import { useSeeWorkflowPreviousVersionsSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowPreviousVersionsSingleRecordAction';
import { useTestWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useTestWorkflowSingleRecordAction';
import { useWorkflowRunRecordActions } from '@/action-menu/actions/record-actions/workflow-run-record-actions/hooks/useWorkflowRunRecordActions';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-ui';

export const useSingleRecordActions = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
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
    registerManageFavoritesSingleRecordAction,
    unregisterManageFavoritesSingleRecordAction,
  } = useManageFavoritesSingleRecordAction({
    recordId: selectedRecordId,
    objectMetadataItem,
  });

  const {
    registerDeleteSingleRecordAction,
    unregisterDeleteSingleRecordAction,
  } = useDeleteSingleRecordAction({
    recordId: selectedRecordId,
    objectMetadataItem,
  });

  const {
    registerWorkflowRunRecordActions,
    unregisterWorkflowRunRecordActions,
  } = useWorkflowRunRecordActions({
    recordId: selectedRecordId,
    objectMetadataItem,
  });

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
    registerSeeWorkflowPreviousVersionsSingleRecordAction,
    unregisterSeeWorkflowPreviousVersionsSingleRecordAction,
  } = useSeeWorkflowPreviousVersionsSingleRecordAction({
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

  const registerSingleRecordActions = () => {
    registerManageFavoritesSingleRecordAction({ position: 1 });
    registerDeleteSingleRecordAction({ position: 2 });
    registerWorkflowRunRecordActions();

    if (objectMetadataItem.nameSingular === 'workflow') {
      registerTestWorkflowSingleRecordAction({ position: 3 });
      registerDiscardWorkflowDraftSingleRecordAction({ position: 4 });
      registerActivateWorkflowDraftSingleRecordAction({ position: 5 });
      registerActivateWorkflowLastPublishedVersionSingleRecordAction({
        position: 6,
      });
      registerDeactivateWorkflowSingleRecordAction({ position: 7 });
      registerSeeWorkflowExecutionsSingleRecordAction({ position: 8 });
      registerSeeWorkflowActiveVersionSingleRecordAction({ position: 9 });
      registerSeeWorkflowPreviousVersionsSingleRecordAction({ position: 10 });
    }
  };

  const unregisterSingleRecordActions = () => {
    unregisterManageFavoritesSingleRecordAction();
    unregisterDeleteSingleRecordAction();
    unregisterWorkflowRunRecordActions();
    unregisterTestWorkflowSingleRecordAction();
    unregisterActivateWorkflowLastPublishedVersionSingleRecordAction();
    unregisterDiscardWorkflowDraftSingleRecordAction();
    unregisterActivateWorkflowDraftSingleRecordAction();
    unregisterDeactivateWorkflowSingleRecordAction();
    unregisterSeeWorkflowExecutionsSingleRecordAction();
    unregisterSeeWorkflowActiveVersionSingleRecordAction();
    unregisterSeeWorkflowPreviousVersionsSingleRecordAction();
  };

  return {
    registerSingleRecordActions,
    unregisterSingleRecordActions,
  };
};
