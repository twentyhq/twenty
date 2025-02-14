import { WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION } from '@/workflow/workflow-diagram/constants/WorkflowVisualizerEdgeDefaultConfiguration';
import {
  WorkflowDiagram,
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { v4 } from 'uuid';

export const addCreateStepNodes = ({ nodes, edges }: WorkflowDiagram) => {
  const nodesWithoutTargets = nodes.filter((node) =>
    edges.every((edge) => edge.source !== node.id),
  );

  const updatedNodes: Array<WorkflowDiagramNode> = nodes.slice();
  const updatedEdges: Array<WorkflowDiagramEdge> = edges.slice();

  for (const node of nodesWithoutTargets) {
    const newCreateStepNode: WorkflowDiagramNode = {
      // FIXME: We need a stable id for create step nodes to be able to preserve their selected status.
      // FIXME: In the future, we'll have conditions and loops. We'll have to set an id to each branch so we can have this stable id.
      id: 'branch-1__create-step',
      type: 'create-step',
      data: {
        nodeType: 'create-step',
        parentNodeId: node.id,
      },
      position: { x: 0, y: 0 },
    };

    updatedNodes.push(newCreateStepNode);

    updatedEdges.push({
      ...WORKFLOW_VISUALIZER_EDGE_DEFAULT_CONFIGURATION,
      id: v4(),
      source: node.id,
      target: newCreateStepNode.id,
    });
  }

  return {
    nodes: updatedNodes,
    edges: updatedEdges,
  };
};
