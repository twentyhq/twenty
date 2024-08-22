import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';

import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
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
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { GRAY_SCALE, IconSettingsAutomation, isDefined } from 'twenty-ui';
import { WorkflowShowPageEffect } from '~/pages/workflows/WorkflowShowPageEffect';
import { WorkflowShowPageHeader } from '~/pages/workflows/WorkflowShowPageHeader';
import { CreateStepNode } from '~/pages/workflows/nodes/CreateStepNode';
import { StepNode } from '~/pages/workflows/nodes/StepNode';

const StyledFlowContainer = styled.div`
  height: 100%;
  width: 100%;

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

const LoadedWorkflow = ({ diagram }: { diagram: WorkflowDiagram }) => {
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
        default: StepNode,
        'create-step': CreateStepNode,
      }}
      fitView
      nodes={nodes.map((node) => ({ ...node, draggable: false }))}
      edges={edges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
    >
      <Background color={GRAY_SCALE.gray25} size={2} />
    </ReactFlow>
  );
};

export const WorkflowShowPage = () => {
  const parameters = useParams<{
    workflowId: string;
  }>();

  const workflowName = 'Test Workflow';

  const showPageWorkflowDiagram = useRecoilValue(showPageWorkflowDiagramState);

  if (parameters.workflowId === undefined) {
    return null;
  }

  return (
    <PageContainer>
      <WorkflowShowPageEffect workflowId={parameters.workflowId} />

      <PageTitle title={workflowName} />
      <WorkflowShowPageHeader
        workflowName={workflowName}
        headerIcon={IconSettingsAutomation}
      ></WorkflowShowPageHeader>
      <PageBody>
        <StyledFlowContainer>
          {showPageWorkflowDiagram === undefined ? null : (
            <LoadedWorkflow diagram={showPageWorkflowDiagram} />
          )}
        </StyledFlowContainer>
      </PageBody>
    </PageContainer>
  );
};
