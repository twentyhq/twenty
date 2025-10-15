import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const TidyUpWorkflowSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { tidyUpWorkflowVersion } = useTidyUpWorkflowVersion();
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const workflow = useWorkflowWithCurrentVersion(recordId);

  const onClick = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!isDefined(workflow)) {
          throw new Error('Failed to get workflow');
        }

        const instanceId = getWorkflowVisualizerComponentInstanceId({
          recordId,
        });
        const workflowDiagramState = workflowDiagramComponentState.atomFamily({
          instanceId,
        });
        const workflowDiagram = snapshot
          .getLoadable(workflowDiagramState)
          .getValue();

        if (!isDefined(workflowDiagram)) {
          return;
        }

        // Get updatable workflow version (inline logic from useGetUpdatableWorkflowVersionOrThrow)
        let workflowVersionId: string;
        if (workflow.currentVersion.status === 'DRAFT') {
          workflowVersionId = workflow.currentVersion.id;
        } else {
          const draftVersionId = await createDraftFromWorkflowVersion({
            workflowId: recordId,
            workflowVersionIdToCopy: workflow.currentVersion.id,
          });

          if (!isDefined(draftVersionId)) {
            throw new Error('Failed to create draft version');
          }

          workflowVersionId = draftVersionId;
        }

        await tidyUpWorkflowVersion(workflowVersionId, workflowDiagram);
      },
    [recordId, workflow, createDraftFromWorkflowVersion, tidyUpWorkflowVersion],
  );

  return <Action onClick={onClick} />;
};
