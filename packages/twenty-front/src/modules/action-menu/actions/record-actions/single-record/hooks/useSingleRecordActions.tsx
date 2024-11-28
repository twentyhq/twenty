import { useDeleteSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useDeleteSingleRecordAction';
import { useManageFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useManageFavoritesSingleRecordAction';
import { useActivateWorkflowDraftSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowDraftSingleRecordAction';
import { useActivateWorkflowLastPublishedVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowLastPublishedVersionSingleRecordAction';
import { useDeactivateWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useDeactivateWorkflowSingleRecordAction';
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

  const registerSingleRecordActions = () => {
    registerManageFavoritesSingleRecordAction({ position: 1 });
    registerDeleteSingleRecordAction({ position: 2 });
    registerWorkflowRunRecordActions();

    if (objectMetadataItem.nameSingular === 'workflow') {
      registerActivateWorkflowDraftSingleRecordAction({ position: 3 });
      registerActivateWorkflowLastPublishedVersionSingleRecordAction({
        position: 4,
      });
      registerDeactivateWorkflowSingleRecordAction({ position: 5 });
      registerSeeWorkflowExecutionsSingleRecordAction({ position: 6 });
      registerSeeWorkflowActiveVersionSingleRecordAction({ position: 7 });
      registerSeeWorkflowPreviousVersionsSingleRecordAction({ position: 8 });
    }
  };

  const unregisterSingleRecordActions = () => {
    unregisterManageFavoritesSingleRecordAction();
    unregisterDeleteSingleRecordAction();
    unregisterWorkflowRunRecordActions();
    unregisterActivateWorkflowLastPublishedVersionSingleRecordAction();
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
