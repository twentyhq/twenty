import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { isDefined } from 'twenty-shared/utils';

export const TidyUpWorkflowSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { tidyUpWorkflowVersion } = useTidyUpWorkflowVersion();
  const instanceId = getWorkflowVisualizerComponentInstanceId({
    recordId,
  });
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);

  const onClick = async () => {
    const workflowDiagramAtom = workflowDiagramComponentState.atomFamily({
      instanceId,
    });
    const workflowDiagram = jotaiStore.get(workflowDiagramAtom);

    if (!isDefined(workflowDiagram)) {
      return;
    }

    const workflowVersionId = await getUpdatableWorkflowVersion();

    await tidyUpWorkflowVersion(workflowVersionId, workflowDiagram);
  };

  return <Action onClick={onClick} />;
};
