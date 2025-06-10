import { WorkflowStep, WorkflowTrigger } from '@/workflow/types/Workflow';
import { FIRST_NODE_POSITION } from '@/workflow/workflow-diagram/constants/FirstNodePosition';
import { VERTICAL_DISTANCE_BETWEEN_TWO_NODES } from '@/workflow/workflow-diagram/constants/VerticalDistanceBetweenTwoNodes';
import { WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEmptyTriggerNodeDefinition';
import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/constants/WorkflowVisualizerEdgeDefaultConfiguration';
import {
  WorkflowDiagram,
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
  WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowDiagramTriggerNode } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramTriggerNode';

import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const generateWorkflowDiagram = ({
  trigger,
  steps,
}: {
  trigger: WorkflowTrigger | undefined;
  steps: Array<WorkflowStep>;
}): WorkflowDiagram => {
  const nodes: Array<WorkflowDiagramNode> = [];
  const edges: Array<WorkflowDiagramEdge> = [];

  if (isDefined(trigger)) {
    nodes.push(getWorkflowDiagramTriggerNode({ trigger }));
  } else {
    nodes.push(WORKFLOW_DIAGRAM_EMPTY_TRIGGER_NODE_DEFINITION);
  }

  const processNode = ({
    stepIndex,
    parentNodeId,
    xPos,
    yPos,
  }: {
    stepIndex: number;
    parentNodeId: string;
    xPos: number;
    yPos: number;
  }) => {
    const step = steps.at(stepIndex);
    if (!isDefined(step)) {
      return;
    }

    const nodeId = step.id;

    nodes.push({
      id: nodeId,
      data: {
        nodeType: 'action',
        actionType: step.type,
        name: step.name,
      } satisfies WorkflowDiagramStepNodeData,
      position: {
        x: xPos,
        y: yPos + VERTICAL_DISTANCE_BETWEEN_TWO_NODES,
      },
    });

    edges.push({
      ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
      id: v4(),
      source: parentNodeId,
      target: nodeId,
    });

    processNode({
      stepIndex: stepIndex + 1,
      parentNodeId: nodeId,
      xPos,
      yPos: yPos + VERTICAL_DISTANCE_BETWEEN_TWO_NODES,
    });
  };

  processNode({
    stepIndex: 0,
    parentNodeId: TRIGGER_STEP_ID,
    xPos: FIRST_NODE_POSITION.x,
    yPos: FIRST_NODE_POSITION.y,
  });

  return {
    nodes,
    edges,
  };
};
