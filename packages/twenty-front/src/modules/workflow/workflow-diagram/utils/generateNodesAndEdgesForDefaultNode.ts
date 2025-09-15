import { type WorkflowStep } from '@/workflow/types/Workflow';
import { type WorkflowContext } from '@/workflow/workflow-diagram/types/WorkflowContext';
import {
  type WorkflowDiagramEdge,
  type WorkflowDiagramNode,
  type WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getEdgeTypeBetweenTwoNodes } from '@/workflow/workflow-diagram/utils/getEdgeTypeBetweenTwoNodes';
import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowVisualizerEdgeDefaultConfiguration';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultSourceHandleId';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultTargetHandleId';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const generateNodesAndEdgesForDefaultNode = ({
  step,
  xPos,
  yPos,
  nodes,
  edges,
  workflowContext,
}: {
  step: WorkflowStep;
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

  step.nextStepIds?.forEach((child) => {
    updatedEdges.push({
      ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
      type: edgeTypeBetweenTwoNodes,
      id: v4(),
      source: step.id,
      sourceHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID,
      target: child,
      targetHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID,
      ...(edgeTypeBetweenTwoNodes.includes('editable')
        ? { deletable: true, selectable: true }
        : {}),
    });
  });

  return {
    nodes: updatedNodes,
    edges: updatedEdges,
  };
};
