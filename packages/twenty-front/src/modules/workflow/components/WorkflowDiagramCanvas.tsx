import { WorkflowDiagramCanvasEffect } from '@/workflow/components/WorkflowDiagramCanvasEffect';
import { WorkflowDiagramCreateStepNode } from '@/workflow/components/WorkflowDiagramCreateStepNode';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStepNode } from '@/workflow/components/WorkflowDiagramStepNode';
import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import {
  WorkflowDiagram,
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
} from '@/workflow/types/WorkflowDiagram';
import { getOrganizedDiagram } from '@/workflow/utils/getOrganizedDiagram';
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  EdgeChange,
  NodeChange,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo } from 'react';
import { useSetRecoilState } from 'recoil';
import { GRAY_SCALE, isDefined } from 'twenty-ui';

export const WorkflowDiagramCanvas = ({
  diagram,
}: {
  diagram: WorkflowDiagram;
}) => {
  const { nodes, edges } = useMemo(
    () => getOrganizedDiagram(diagram),
    [diagram],
  );

  const setWorkflowDiagram = useSetRecoilState(workflowDiagramState);

  const handleNodesChange = (
    nodeChanges: Array<NodeChange<WorkflowDiagramNode>>,
  ) => {
    setWorkflowDiagram((diagram) => {
      if (isDefined(diagram) === false) {
        throw new Error(
          'It must be impossible for the nodes to be updated if the diagram is not defined yet. Be sure the diagram is rendered only when defined.',
        );
      }

      return {
        ...diagram,
        nodes: applyNodeChanges(nodeChanges, diagram.nodes),
      };
    });
  };

  const handleEdgesChange = (
    edgeChanges: Array<EdgeChange<WorkflowDiagramEdge>>,
  ) => {
    setWorkflowDiagram((diagram) => {
      if (isDefined(diagram) === false) {
        throw new Error(
          'It must be impossible for the edges to be updated if the diagram is not defined yet. Be sure the diagram is rendered only when defined.',
        );
      }

      return {
        ...diagram,
        edges: applyEdgeChanges(edgeChanges, diagram.edges),
      };
    });
  };

  return (
    <ReactFlow
      nodeTypes={{
        default: WorkflowDiagramStepNode,
        'create-step': WorkflowDiagramCreateStepNode,
        'empty-trigger': WorkflowDiagramEmptyTrigger,
      }}
      fitView
      nodes={nodes.map((node) => ({ ...node, draggable: false }))}
      edges={edges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
    >
      <WorkflowDiagramCanvasEffect />

      <Background color={GRAY_SCALE.gray25} size={2} />
    </ReactFlow>
  );
};
