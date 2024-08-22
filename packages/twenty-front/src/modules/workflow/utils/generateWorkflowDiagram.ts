import { WorkflowAction, WorkflowTrigger } from '@/workflow/types/Workflow';
import {
  WorkflowDiagram,
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
} from '@/workflow/types/WorkflowDiagram';
import { MarkerType } from '@xyflow/react';
import { isDefined } from 'twenty-ui';
import { v4 } from 'uuid';

export const generateWorklowDiagram = (
  trigger: WorkflowTrigger,
): WorkflowDiagram => {
  const nodes: Array<WorkflowDiagramNode> = [];
  const edges: Array<WorkflowDiagramEdge> = [];

  // Helper function to generate nodes and edges recursively
  const processNode = (
    action: WorkflowAction,
    parentNodeId: string,
    xPos: number,
    yPos: number,
  ) => {
    const nodeId = v4();
    nodes.push({
      id: nodeId,
      data: {
        nodeType: 'action',
        label: action.name,
      },
      position: {
        x: xPos,
        y: yPos,
      },
    });

    // Create an edge from the parent node to this node
    edges.push({
      id: v4(),
      source: parentNodeId,
      target: nodeId,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    });

    // Recursively generate flow for the next action if it exists
    if (isDefined(action.nextAction)) {
      processNode(action.nextAction, nodeId, xPos + 150, yPos + 100);
    }
  };

  // Start with the trigger node
  const triggerNodeId = v4();
  nodes.push({
    id: triggerNodeId,
    data: {
      nodeType: 'trigger',
      label: trigger.settings.triggerName,
    },
    position: {
      x: 0,
      y: 0,
    },
  });

  // If there's a next action, start the recursive generation
  if (isDefined(trigger.nextAction)) {
    processNode(trigger.nextAction, triggerNodeId, 150, 100);
  }

  return {
    nodes,
    edges,
  };
};
