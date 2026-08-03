import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const TidyUpWorkflowSingleRecordCommand = () => {
  const store = useStore();
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const instanceId = getWorkflowVisualizerComponentInstanceId({
    recordId: recordId ?? '',
  });
  const { tidyUpWorkflowVersion } = useTidyUpWorkflowVersion(instanceId);
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to tidy up workflow');
  }

  const handleExecute = async () => {
    const workflowDiagramAtom = workflowDiagramComponentState.atomFamily({
      instanceId,
    });
    const workflowDiagram = store.get(workflowDiagramAtom);

    if (!isDefined(workflowDiagram)) {
      return;
    }

    const workflowVersionId = await getUpdatableWorkflowVersion();

    const tidiedUpDiagram = await tidyUpWorkflowVersion(
      workflowVersionId,
      workflowDiagram,
    );

    if (isDefined(tidiedUpDiagram)) {
      store.set(workflowDiagramAtom, tidiedUpDiagram);
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
