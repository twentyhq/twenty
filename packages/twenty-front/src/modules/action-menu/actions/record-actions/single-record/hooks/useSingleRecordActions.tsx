import { useDeleteSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useDeleteSingleRecordAction';
import { useManageFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useManageFavoritesSingleRecordAction';
import { useActivateWorkflowDraftSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowDraftSingleRecordAction';
import { useActivateWorkflowLastPublishedVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowLastPublishedVersionSingleRecordAction';
import { useDeactivateWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDeactivateWorkflowSingleRecordAction';
import { useDiscardWorkflowDraftSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDiscardWorkflowDraftSingleRecordAction';
import { useSeeWorkflowActiveVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowActiveVersionSingleRecordAction';
import { useSeeWorkflowExecutionsSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowExecutionsSingleRecordAction';
import { useSeeWorkflowPreviousVersionsSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useSeeWorkflowPreviousVersionsSingleRecordAction';
import { useWorkflowRunRecordActions } from '@/action-menu/actions/record-actions/workflow-run-record-actions/hooks/useWorkflowRunRecordActions';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useSingleRecordActions = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const {
    registerManageFavoritesSingleRecordAction,
    unregisterManageFavoritesSingleRecordAction,
  } = useManageFavoritesSingleRecordAction({
    objectMetadataItem,
  });

  const {
    registerDeleteSingleRecordAction,
    unregisterDeleteSingleRecordAction,
  } = useDeleteSingleRecordAction({
    objectMetadataItem,
  });

  const {
    registerWorkflowRunRecordActions,
    unregisterWorkflowRunRecordActions,
  } = useWorkflowRunRecordActions({
    objectMetadataItem,
  });

  const {
    registerActivateWorkflowLastPublishedVersionSingleRecordAction,
    unregisterActivateWorkflowLastPublishedVersionSingleRecordAction,
  } = useActivateWorkflowLastPublishedVersionSingleRecordAction();

  const {
    registerDeactivateWorkflowSingleRecordAction,
    unregisterDeactivateWorkflowSingleRecordAction,
  } = useDeactivateWorkflowSingleRecordAction();

  const {
    registerSeeWorkflowExecutionsSingleRecordAction,
    unregisterSeeWorkflowExecutionsSingleRecordAction,
  } = useSeeWorkflowExecutionsSingleRecordAction();

  const {
    registerSeeWorkflowPreviousVersionsSingleRecordAction,
    unregisterSeeWorkflowPreviousVersionsSingleRecordAction,
  } = useSeeWorkflowPreviousVersionsSingleRecordAction();

  const {
    registerSeeWorkflowActiveVersionSingleRecordAction,
    unregisterSeeWorkflowActiveVersionSingleRecordAction,
  } = useSeeWorkflowActiveVersionSingleRecordAction();

  const {
    registerActivateWorkflowDraftSingleRecordAction,
    unregisterActivateWorkflowDraftSingleRecordAction,
  } = useActivateWorkflowDraftSingleRecordAction();

  const {
    registerDiscardWorkflowDraftSingleRecordAction,
    unregisterDiscardWorkflowDraftSingleRecordAction,
  } = useDiscardWorkflowDraftSingleRecordAction();

  const registerSingleRecordActions = () => {
    registerManageFavoritesSingleRecordAction({ position: 1 });
    registerDeleteSingleRecordAction({ position: 2 });
    registerWorkflowRunRecordActions();

    if (objectMetadataItem.nameSingular === 'workflow') {
      registerDiscardWorkflowDraftSingleRecordAction({ position: 3 });
      registerActivateWorkflowDraftSingleRecordAction({ position: 4 });
      registerActivateWorkflowLastPublishedVersionSingleRecordAction({
        position: 5,
      });
      registerDeactivateWorkflowSingleRecordAction({ position: 6 });
      registerSeeWorkflowExecutionsSingleRecordAction({ position: 7 });
      registerSeeWorkflowActiveVersionSingleRecordAction({ position: 8 });
      registerSeeWorkflowPreviousVersionsSingleRecordAction({ position: 9 });
    }
  };

  const unregisterSingleRecordActions = () => {
    unregisterManageFavoritesSingleRecordAction();
    unregisterDeleteSingleRecordAction();
    unregisterWorkflowRunRecordActions();
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
