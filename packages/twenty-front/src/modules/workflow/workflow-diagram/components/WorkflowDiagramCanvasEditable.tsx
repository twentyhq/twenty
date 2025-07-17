import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasEditableEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditableEffect';
import { WorkflowDiagramCreateStepNode } from '@/workflow/workflow-diagram/components/WorkflowDiagramCreateStepNode';
import { WorkflowDiagramDefaultEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdge';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStepNodeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeEditable';
import { WorkflowVisualizerDiagramContextProvider } from '@/workflow/workflow-diagram/contexts/WorkflowVisualizerDiagramContext';
import { getWorkflowVersionStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowVersionStatusTagProps';
import { ReactFlowProvider } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/display';

export const WorkflowDiagramCanvasEditable = ({
  versionStatus,
}: {
  versionStatus: WorkflowVersionStatus;
}) => {
  const tagProps = getWorkflowVersionStatusTagProps({
    workflowVersionStatus: versionStatus,
  });

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();

  return (
    <WorkflowVisualizerDiagramContextProvider
      value={{
        openFilterInCommandMenu: (edgeData) => {
          if (!isDefined(workflowVisualizerWorkflowId)) {
            throw new Error(
              'Workflow ID must be configured for the edge when opening a filter in command menu',
            );
          }

          openWorkflowEditStepInCommandMenu(
            workflowVisualizerWorkflowId,
            'Filter',
            IconFilter,
          );
        },
      }}
    >
      <ReactFlowProvider>
        <WorkflowDiagramCanvasBase
          nodeTypes={{
            default: WorkflowDiagramStepNodeEditable,
            'create-step': WorkflowDiagramCreateStepNode,
            'empty-trigger': WorkflowDiagramEmptyTrigger,
          }}
          edgeTypes={{
            default: WorkflowDiagramDefaultEdge,
          }}
          tagContainerTestId="workflow-visualizer-status"
          tagColor={tagProps.color}
          tagText={tagProps.text}
        />

        <WorkflowDiagramCanvasEditableEffect />
      </ReactFlowProvider>
    </WorkflowVisualizerDiagramContextProvider>
  );
};
