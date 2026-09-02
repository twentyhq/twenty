import { useEffect } from 'react';

import { type PreviewedCoreWorkflowVersion } from '@/object-core/workflows/versions/states/previewedCoreWorkflowVersionFamilyState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { generateWorkflowDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowDiagram';

export const CoreWorkflowVersionDiagramEffect = ({
  workflowId,
  previewedCoreWorkflowVersion,
}: {
  workflowId: string;
  previewedCoreWorkflowVersion: PreviewedCoreWorkflowVersion;
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

  const { trigger, steps, workspaceWorkflowVersionId } =
    previewedCoreWorkflowVersion;

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
