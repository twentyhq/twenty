import { WorkflowVersionStatusTag } from '@/workflow/components/WorkflowVersionStatusTag';
import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import {
  WorkflowDiagram,
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
  WorkflowDiagramNodeType,
} from '@/workflow/types/WorkflowDiagram';
import { getOrganizedDiagram } from '@/workflow/utils/getOrganizedDiagram';
import styled from '@emotion/styled';
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  EdgeChange,
  FitViewOptions,
  NodeChange,
  NodeProps,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, { useMemo } from 'react';
import { useSetRecoilState } from 'recoil';
import { GRAY_SCALE, isDefined } from 'twenty-ui';

const StyledResetReactflowStyles = styled.div`
  height: 100%;
  width: 100%;
  position: relative;

  /* Below we reset the default styling of Reactflow */
  .react-flow__node-input,
  .react-flow__node-default,
  .react-flow__node-output,
  .react-flow__node-group {
    padding: 0;
  }

  --xy-node-border-radius: none;
  --xy-node-border: none;
  --xy-node-background-color: none;
  --xy-node-boxshadow-hover: none;
  --xy-node-boxshadow-selected: none;
`;

const StyledStatusTagContainer = styled.div`
  left: 0;
  top: 0;
  position: absolute;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const defaultFitViewOptions: FitViewOptions = {
  minZoom: 1.3,
  maxZoom: 1.3,
};

export const WorkflowDiagramCanvasBase = ({
  diagram,
  status,
  nodeTypes,
  children,
}: {
  diagram: WorkflowDiagram;
  status: WorkflowVersionStatus;
  nodeTypes: Partial<
    Record<
      WorkflowDiagramNodeType,
      React.ComponentType<
        NodeProps & {
          data: any;
          type: any;
        }
      >
    >
  >;
  children?: React.ReactNode;
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
    <StyledResetReactflowStyles>
      <ReactFlow
        onInit={({ fitView }) => {
          fitView(defaultFitViewOptions);
        }}
        nodeTypes={nodeTypes}
        fitView
        nodes={nodes.map((node) => ({ ...node, draggable: false }))}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
      >
        <Background color={GRAY_SCALE.gray25} size={2} />

        {children}

        <StyledStatusTagContainer>
          <WorkflowVersionStatusTag versionStatus={status} />
        </StyledStatusTagContainer>
      </ReactFlow>
    </StyledResetReactflowStyles>
  );
};
