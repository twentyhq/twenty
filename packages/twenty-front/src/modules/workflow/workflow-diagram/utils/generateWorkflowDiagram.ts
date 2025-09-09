import {
  type WorkflowStep,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { FIRST_NODE_POSITION } from '@/workflow/workflow-diagram/constants/FirstNodePosition';
import { VERTICAL_DISTANCE_BETWEEN_TWO_NODES } from '@/workflow/workflow-diagram/constants/VerticalDistanceBetweenTwoNodes';
import { type WorkflowContext } from '@/workflow/workflow-diagram/types/WorkflowContext';
import {
  type WorkflowDiagram,
  type WorkflowDiagramEdge,
  type WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getEdgeTypeBetweenTwoNodes } from '@/workflow/workflow-diagram/utils/getEdgeTypeBetweenTwoNodes';
import { getWorkflowDiagramTriggerNode } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramTriggerNode';
import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowVisualizerEdgeDefaultConfiguration';

import { WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEmptyTriggerNodeDefinition';
import { generateNodesAndEdgesForDefaultNode } from '@/workflow/workflow-diagram/utils/generateNodesAndEdgesForDefaultNode';
import { generateNodesAndEdgesForIteratorNode } from '@/workflow/workflow-diagram/utils/generateNodesAndEdgesForIteratorNode';
import { getRootStepIds } from '@/workflow/workflow-trigger/utils/getRootStepIds';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

export const generateWorkflowDiagram = ({
  trigger,
  steps,
  workflowContext,
  isWorkflowBranchEnabled = false,
}: {
  trigger: WorkflowTrigger | undefined;
  steps: Array<WorkflowStep>;
  workflowContext: WorkflowContext;
  isWorkflowBranchEnabled?: boolean;
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

    const triggerNextStepIds =
      isDefined(steps) && !isWorkflowBranchEnabled ? getRootStepIds(steps) : [];

    triggerNextStepIds.forEach((stepId) => {
      edges.push({
        ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
        type: 'blank',
        id: v4(),
        source: 'trigger',
        target: stepId,
      });
    });
  }

  for (const stepLinkToTriggerId of trigger?.nextStepIds ?? []) {
    edges.push({
      ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
      type: edgeTypeBetweenTwoNodes,
      id: v4(),
      source: TRIGGER_STEP_ID,
      target: stepLinkToTriggerId,
      ...(edgeTypeBetweenTwoNodes.includes('editable')
        ? { deletable: true, selectable: true }
        : {}),
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
      default: {
        const { nodes: defaultNodes, edges: defaultEdges } =
          generateNodesAndEdgesForDefaultNode({
            step,
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
