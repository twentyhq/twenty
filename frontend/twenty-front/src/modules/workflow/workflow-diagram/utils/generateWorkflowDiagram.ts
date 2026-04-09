import {
  type WorkflowStep,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { FIRST_NODE_POSITION } from '@/workflow/workflow-diagram/constants/FirstNodePosition';
import { VERTICAL_DISTANCE_BETWEEN_TWO_NODES } from '@/workflow/workflow-diagram/constants/VerticalDistanceBetweenTwoNodes';
import { WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEmptyTriggerNodeDefinition';
import { type WorkflowContext } from '@/workflow/workflow-diagram/types/WorkflowContext';
import {
  type WorkflowDiagram,
  type WorkflowDiagramEdge,
  type WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { generateNodesAndEdgesForDefaultNode } from '@/workflow/workflow-diagram/utils/generateNodesAndEdgesForDefaultNode';
import { generateNodesAndEdgesForIfElseNode } from '@/workflow/workflow-diagram/utils/generateNodesAndEdgesForIfElseNode';
import { generateNodesAndEdgesForIteratorNode } from '@/workflow/workflow-diagram/utils/generateNodesAndEdgesForIteratorNode';
import { getEdgeTypeBetweenTwoNodes } from '@/workflow/workflow-diagram/utils/getEdgeTypeBetweenTwoNodes';
import { getWorkflowDiagramTriggerNode } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramTriggerNode';
import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowVisualizerEdgeDefaultConfiguration';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultSourceHandleId';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultTargetHandleId';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

export const generateWorkflowDiagram = ({
  trigger,
  steps,
  workflowContext,
}: {
  trigger: WorkflowTrigger | undefined;
  steps: Array<WorkflowStep>;
  workflowContext: WorkflowContext;
}): WorkflowDiagram => {
  let nodes: Array<WorkflowDiagramNode> = [];
  let edges: Array<WorkflowDiagramEdge> = [];

  const edgeTypeBetweenTwoNodes = getEdgeTypeBetweenTwoNodes({
    workflowContext,
  });

  if (isDefined(trigger)) {
    nodes.push(getWorkflowDiagramTriggerNode({ trigger }));
  } else {
    nodes.push(WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION);
  }

  for (const stepLinkToTriggerId of trigger?.nextStepIds ?? []) {
    edges.push({
      ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
      type: edgeTypeBetweenTwoNodes,
      id: v4(),
      source: TRIGGER_STEP_ID,
      sourceHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID,
      target: stepLinkToTriggerId,
      ...(workflowContext === 'workflow'
        ? {
            deletable: true,
            selectable: true,
            reconnectable: 'target',
          }
        : {}),
      targetHandle: WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID,
    });
  }

  const xPos = FIRST_NODE_POSITION.x;
  let levelYPos = FIRST_NODE_POSITION.y;

  for (const step of steps) {
    levelYPos += VERTICAL_DISTANCE_BETWEEN_TWO_NODES;

    switch (step.type) {
      case 'ITERATOR': {
        const { nodes: iteratorNodes, edges: iteratorEdges } =
          generateNodesAndEdgesForIteratorNode({
            step,
            steps,
            xPos,
            yPos: levelYPos,
            nodes,
            edges,
            workflowContext,
          });

        nodes = iteratorNodes;
        edges = iteratorEdges;

        break;
      }
      case 'IF_ELSE': {
        const { nodes: ifElseNodes, edges: ifElseEdges } =
          generateNodesAndEdgesForIfElseNode({
            step,
            steps,
            xPos,
            yPos: levelYPos,
            nodes,
            edges,
            workflowContext,
          });

        nodes = ifElseNodes;
        edges = ifElseEdges;

        break;
      }
      default: {
        const { nodes: defaultNodes, edges: defaultEdges } =
          generateNodesAndEdgesForDefaultNode({
            step,
            steps,
            xPos,
            yPos: levelYPos,
            nodes,
            edges,
            workflowContext,
          });

        nodes = defaultNodes;
        edges = defaultEdges;

        break;
      }
    }
  }

  return {
    nodes,
    edges,
  };
};
