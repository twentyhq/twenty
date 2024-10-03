import { WorkflowDiagramCanvasEffect } from '@/workflow/components/WorkflowDiagramCanvasEffect';
import { WorkflowDiagramCreateStepNode } from '@/workflow/components/WorkflowDiagramCreateStepNode';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStepNode } from '@/workflow/components/WorkflowDiagramStepNode';
import { WorkflowVersionStatusTag } from '@/workflow/components/WorkflowVersionStatusTag';
import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import {
  WorkflowDiagram,
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
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
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo } from 'react';
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

export const WorkflowDiagramCanvas = ({
  diagram,
  workflowWithCurrentVersion,
}: {
  diagram: WorkflowDiagram;
  workflowWithCurrentVersion: WorkflowWithCurrentVersion;
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
        key={workflowWithCurrentVersion.currentVersion.id}
        onInit={({ fitView }) => {
          fitView(defaultFitViewOptions);
        }}
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

      <StyledStatusTagContainer>
        <WorkflowVersionStatusTag
          versionStatus={workflowWithCurrentVersion.currentVersion.status}
        />
      </StyledStatusTagContainer>
    </StyledResetReactflowStyles>
  );
};
