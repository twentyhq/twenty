import {
  type WorkflowIfElseAction,
  type WorkflowStep,
} from '@/workflow/types/Workflow';
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
import { getBranchLabel } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/getBranchLabel';
import { Position } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const generateNodesAndEdgesForIfElseNode = ({
  step,
  steps,
  xPos,
  yPos,
  nodes,
  edges,
  workflowContext,
}: {
  step: WorkflowIfElseAction;
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

  const ifElseNode: WorkflowDiagramNode = {
    id: step.id,
    data: {
      nodeType: 'action',
      actionType: step.type,
      name: step.name,
      hasNextStepIds: true,
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
  };

  updatedNodes.push(ifElseNode);

  const branches = step.settings.input.branches;
  const totalBranches = branches.length;

  branches.forEach((branch, branchIndex) => {
    const label = getBranchLabel({
      branchIndex,
      totalBranches,
      branch,
    });

    const nextStepIds = branch.nextStepIds;
    for (const nextStepId of nextStepIds) {
      const nextStep = steps.find((s) => s.id === nextStepId);
      if (!isDefined(nextStep)) {
        continue;
      }

      updatedEdges.push({
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
        type: edgeTypeBetweenTwoNodes,
        id: v4(),
        source: step.id,
        sourceHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID,
        target: nextStepId,
        deletable: false,
        selectable: false,
        reconnectable: false,
        targetHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID,
        data: {
          ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION.data,
          labelOptions: {
            position: Position.Bottom,
            label,
          },
          edgePathStrategy: getEdgePathStrategy({
            step,
            steps,
            nextStepId,
          }),
        },
      });
    }
  });

  return {
    nodes: updatedNodes,
    edges: updatedEdges,
  };
};
