import { WorkflowShowPageDiagramCreateStepNode } from '@/workflow/components/WorkflowShowPageDiagramCreateStepNode';
import { WorkflowShowPageDiagramEffect } from '@/workflow/components/WorkflowShowPageDiagramEffect';
import { WorkflowShowPageDiagramStepNode } from '@/workflow/components/WorkflowShowPageDiagramStepNode';
import { showPageWorkflowDiagramState } from '@/workflow/states/showPageWorkflowDiagramState';
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

export const WorkflowShowPageDiagram = ({
  diagram,
}: {
  diagram: WorkflowDiagram;
}) => {
  const { nodes, edges } = useMemo(
    () => getOrganizedDiagram(diagram),
    [diagram],
  );

  const setShowPageWorkflowDiagram = useSetRecoilState(
    showPageWorkflowDiagramState,
  );

  const handleNodesChange = (
    nodeChanges: Array<NodeChange<WorkflowDiagramNode>>,
  ) => {
    setShowPageWorkflowDiagram((diagram) => {
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
    setShowPageWorkflowDiagram((diagram) => {
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
        default: WorkflowShowPageDiagramStepNode,
        'create-step': WorkflowShowPageDiagramCreateStepNode,
      }}
      fitView
      nodes={nodes.map((node) => ({ ...node, draggable: false }))}
      edges={edges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
    >
      <WorkflowShowPageDiagramEffect />

      <Background color={GRAY_SCALE.gray25} size={2} />
    </ReactFlow>
  );
};
