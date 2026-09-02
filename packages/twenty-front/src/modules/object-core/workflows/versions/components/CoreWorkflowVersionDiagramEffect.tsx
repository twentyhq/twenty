import { useEffect } from 'react';

import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';

export const CoreWorkflowVersionDiagramEffect = ({
  workflowId,
  workspaceWorkflowVersionId,
  trigger,
  steps,
}: {
  workflowId: string;
  workspaceWorkflowVersionId: string;
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
  }, [
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
