import { useDeleteSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useDeleteSingleRecordAction';
import { useManageFavoritesSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/hooks/useManageFavoritesSingleRecordAction';
import { useActivateWorkflowSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-actions/hooks/useActivateWorkflowSingleRecordAction';
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
    registerActivateWorkflowSingleRecordAction,
    unregisterActivateWorkflowSingleRecordAction,
  } = useActivateWorkflowSingleRecordAction();

  const {
    registerSeeWorkflowExecutionsSingleRecordAction,
    unregisterSeeWorkflowExecutionsSingleRecordAction,
  } = useSeeWorkflowExecutionsSingleRecordAction();

  const {
    registerSeeWorkflowPreviousVersionsSingleRecordAction,
    unregisterSeeWorkflowPreviousVersionsSingleRecordAction,
  } = useSeeWorkflowPreviousVersionsSingleRecordAction();

  const registerSingleRecordActions = () => {
    registerManageFavoritesSingleRecordAction({ position: 1 });
    registerDeleteSingleRecordAction({ position: 2 });
    registerWorkflowRunRecordActions();

    if (objectMetadataItem.nameSingular === 'workflow') {
      registerActivateWorkflowSingleRecordAction({ position: 3 });
      registerSeeWorkflowExecutionsSingleRecordAction({ position: 4 });
      registerSeeWorkflowPreviousVersionsSingleRecordAction({ position: 5 });
    }
  };

  const unregisterSingleRecordActions = () => {
    unregisterManageFavoritesSingleRecordAction();
    unregisterDeleteSingleRecordAction();
    unregisterWorkflowRunRecordActions();
    unregisterActivateWorkflowSingleRecordAction();
    unregisterSeeWorkflowExecutionsSingleRecordAction();
    unregisterSeeWorkflowPreviousVersionsSingleRecordAction();
  };

  return {
    registerSingleRecordActions,
    unregisterSingleRecordActions,
  };
};
