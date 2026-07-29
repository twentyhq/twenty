import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { useWorkflowVersionContent } from '@/workflow/workflow-version/hooks/useWorkflowVersionContent';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const WorkflowVersionVisualizerEffect = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useWorkflowVersion(workflowVersionId);
  const { content } = useWorkflowVersionContent(workflowVersionId);

  const setFlow = useSetAtomComponentState(flowComponentState);
  const setWorkflowDiagram = useSetAtomComponentState(
    workflowDiagramComponentState,
  );
  const setWorkflowVisualizerWorkflowId = useSetAtomComponentState(
    workflowVisualizerWorkflowIdComponentState,
  );
  const setWorkflowVisualizerWorkflowVersionId = useSetAtomComponentState(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  const { populateStepsOutputSchema } = useStepsOutputSchema();

  useEffect(() => {
    if (
      !isDefined(workflowVersion) ||
      !isDefined(content) ||
      content.workflowVersionId !== workflowVersion.id
    ) {
      setFlow(undefined);

      return;
    }

    setFlow({
      workflowVersionId: workflowVersion.id,
      trigger: content.trigger,
      steps: content.steps,
    });

    setWorkflowVisualizerWorkflowId(workflowVersion.workflowId);
    setWorkflowVisualizerWorkflowVersionId(workflowVersion.id);
  }, [
    content,
    setFlow,
    setWorkflowVisualizerWorkflowId,
    setWorkflowVisualizerWorkflowVersionId,
    workflowVersion,
  ]);

  useEffect(() => {
    if (
      !isDefined(content) ||
      content.workflowVersionId !== workflowVersionId
    ) {
      setWorkflowDiagram(undefined);

      return;
    }

    const nextWorkflowDiagram = generateWorkflowDiagram({
      trigger: content.trigger ?? undefined,
      steps: content.steps ?? [],
      workflowContext: 'workflow-version',
    });

    setWorkflowDiagram(nextWorkflowDiagram);
  }, [content, setWorkflowDiagram, workflowVersionId]);

  useEffect(() => {
    if (
      !isDefined(workflowVersion) ||
      !isDefined(content) ||
      content.workflowVersionId !== workflowVersion.id
    ) {
      return;
    }

    populateStepsOutputSchema({
      ...workflowVersion,
      trigger: content.trigger,
      steps: content.steps,
    });
  }, [content, populateStepsOutputSchema, workflowVersion]);

  return null;
};
