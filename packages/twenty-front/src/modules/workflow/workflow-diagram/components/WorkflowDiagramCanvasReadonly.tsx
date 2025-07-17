import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasReadonlyEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonlyEffect';
import { WorkflowDiagramDefaultEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdge';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeReadonly';
import { WorkflowDiagramSuccessEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramSuccessEdge';
import { WorkflowVisualizerDiagramContextProvider } from '@/workflow/workflow-diagram/contexts/WorkflowVisualizerDiagramContext';
import { getWorkflowVersionStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowVersionStatusTagProps';
import { ReactFlowProvider } from '@xyflow/react';
import { IconFilter } from 'twenty-ui/display';

export const WorkflowDiagramCanvasReadonly = ({
  versionStatus,
}: {
  versionStatus: WorkflowVersionStatus;
}) => {
  const tagProps = getWorkflowVersionStatusTagProps({
    workflowVersionStatus: versionStatus,
  });

  const { openWorkflowViewStepInCommandMenu } = useWorkflowCommandMenu();

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflowVisualizerWorkflowVersionId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  return (
    <WorkflowVisualizerDiagramContextProvider
      value={{
        openFilterInCommandMenu: () => {
          if (!workflowVisualizerWorkflowId) {
            throw new Error('Workflow ID is required');
          }

          if (!workflowVisualizerWorkflowVersionId) {
            throw new Error('Workflow version ID is required');
          }

          openWorkflowViewStepInCommandMenu({
            workflowId: workflowVisualizerWorkflowId,
            workflowVersionId: workflowVisualizerWorkflowVersionId,
            title: 'Filter',
            icon: IconFilter,
          });
        },
      }}
    >
      <ReactFlowProvider>
        <WorkflowDiagramCanvasBase
          nodeTypes={{
            default: WorkflowDiagramStepNodeReadonly,
            'empty-trigger': WorkflowDiagramEmptyTrigger,
          }}
          edgeTypes={{
            default: WorkflowDiagramDefaultEdge,
            success: WorkflowDiagramSuccessEdge,
          }}
          tagContainerTestId="workflow-visualizer-status"
          tagColor={tagProps.color}
          tagText={tagProps.text}
        />

        <WorkflowDiagramCanvasReadonlyEffect />
      </ReactFlowProvider>
    </WorkflowVisualizerDiagramContextProvider>
  );
};
