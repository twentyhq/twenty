import { type WorkflowStep } from '@/workflow/types/Workflow';
import { type WorkflowContext } from '@/workflow/workflow-diagram/types/WorkflowContext';
import {
  type WorkflowDiagramEdge,
  type WorkflowDiagramNode,
  type WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getEdgePathStrategy } from '@/workflow/workflow-diagram/utils/getEdgePathStrategy';
import { getEdgeTypeBetweenTwoNodes } from '@/workflow/workflow-diagram/utils/getEdgeTypeBetweenTwoNodes';
import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowVisualizerEdgeDefaultConfiguration';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultSourceHandleId';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultTargetHandleId';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const generateNodesAndEdgesForDefaultNode = ({
  step,
  steps,
  xPos,
  yPos,
  nodes,
  edges,
  workflowContext,
}: {
  step: WorkflowStep;
  steps: WorkflowStep[];
  yPos: number;
  xPos: number;
  nodes: readonly WorkflowDiagramNode[];
  edges: readonly WorkflowDiagramEdge[];
  workflowContext: WorkflowContext;
}): {
  nodes: Array<WorkflowDiagramNode>;
  edges: Array<WorkflowDiagramEdge>;
} => {
  const edgeTypeBetweenTwoNodes = getEdgeTypeBetweenTwoNodes({
    workflowContext,
  });

  const updatedNodes = [...nodes];
  const updatedEdges = [...edges];

  updatedNodes.push({
    id: step.id,
    data: {
      nodeType: 'action',
      actionType: step.type,
      name: step.name,
      hasNextStepIds:
        isDefined(step.nextStepIds) && step.nextStepIds.length > 0,
      stepId: step.id,
      position: step.position ?? {
        x: xPos,
        y: yPos,
      },
    } satisfies WorkflowDiagramStepNodeData,
    position: step.position ?? {
      x: xPos,
      y: yPos,
    },
  });

  if (isNonEmptyArray(step.nextStepIds)) {
    for (const nextStepId of step.nextStepIds) {
      updatedEdges.push({
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
        type: edgeTypeBetweenTwoNodes,
        id: v4(),
        source: step.id,
        sourceHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID,
        target: nextStepId,
        targetHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID,
        data: {
          ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION.data,
          edgePathStrategy: getEdgePathStrategy({
            step,
            steps,
            nextStepId,
          }),
        },
        ...(workflowContext === 'workflow'
          ? {
              deletable: true,
              selectable: true,
              reconnectable: 'target',
            }
          : {}),
      });
    }
  }

  return {
    nodes: updatedNodes,
    edges: updatedEdges,
  };
};
