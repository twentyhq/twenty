import { useEffect } from 'react';

import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import {
  type WorkflowAction,
  type WorkflowTrigger,
  type WorkflowVersionStatus,
} from '@/workflow/types/Workflow';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';

export const CoreWorkflowVersionDiagramEffect = ({
  workflowId,
  workspaceWorkflowVersionId,
  label,
  status,
  createdAt,
  trigger,
  steps,
}: {
  workflowId: string;
  workspaceWorkflowVersionId: string;
  label: string;
  status: WorkflowVersionStatus;
  createdAt: string;
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
}) => {
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
    setFlow({
      workflowVersionId: workspaceWorkflowVersionId,
      trigger,
      steps,
    });
    setWorkflowVisualizerWorkflowId(workflowId);
    setWorkflowVisualizerWorkflowVersionId(workspaceWorkflowVersionId);
    setWorkflowDiagram(
      generateWorkflowDiagram({
        trigger: trigger ?? undefined,
        steps: steps ?? [],
        workflowContext: 'workflow-version',
      }),
    );
    populateStepsOutputSchema({
      __typename: 'WorkflowVersion',
      id: workspaceWorkflowVersionId,
      name: label,
      workflowId,
      status,
      createdAt,
      updatedAt: createdAt,
      trigger,
      steps,
    });
  }, [
    createdAt,
    label,
    populateStepsOutputSchema,
    status,
    setFlow,
    setWorkflowDiagram,
    setWorkflowVisualizerWorkflowId,
    setWorkflowVisualizerWorkflowVersionId,
    steps,
    trigger,
    workflowId,
    workspaceWorkflowVersionId,
  ]);

  return null;
};
