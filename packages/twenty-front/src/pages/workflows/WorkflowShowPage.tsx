import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';

import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { currentWorkflowDataState } from '@/workflow/states/currentWorkflowDataState';
import { WorkflowDiagram } from '@/workflow/types/Workflow';
import Dagre from '@dagrejs/dagre';
import {
  Background,
  Edge,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { GRAY_SCALE, IconSettingsAutomation } from 'twenty-ui';
import { WorkflowShowPageEffect } from '~/pages/workflows/WorkflowShowPageEffect';
import { WorkflowShowPageHeader } from '~/pages/workflows/WorkflowShowPageHeader';
import { CreateStepNode } from '~/pages/workflows/nodes/CreateStepNode';
import { StepNode } from '~/pages/workflows/nodes/StepNode';
import { WorkflowDiagramNodeData } from '~/pages/workflows/nodes/base';

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

const getLayoutedElements = (
  nodes: Array<Node<WorkflowDiagramNodeData>>,
  edges: Array<Edge>,
) => {
  const graph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: 'TB' });

  edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    graph.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    }),
  );

  Dagre.layout(graph);

  return {
    nodes: nodes.map((node) => {
      const position = graph.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

const LoadedWorkflow = ({ flowData }: { flowData: WorkflowDiagram }) => {
  const [rawNodes, setRawNodes, onRawNodesChange] = useNodesState(
    flowData.nodes,
  );
  const [rawEdges, setRawEdges, onRawEdgesChange] = useEdgesState(
    flowData.edges,
  );

  useEffect(() => {
    setRawNodes(flowData.nodes);
    setRawEdges(flowData.edges);
  }, [setRawNodes, setRawEdges, flowData.nodes, flowData.edges]);

  const { nodes, edges } = useMemo(
    () => getLayoutedElements(rawNodes, rawEdges),
    [rawNodes, rawEdges],
  );

  return (
    <ReactFlow
      nodeTypes={{
        default: StepNode,
        'create-step': CreateStepNode,
      }}
      fitView
      nodes={nodes.map((node) => ({ ...node, draggable: false }))}
      edges={edges}
      onNodesChange={onRawNodesChange}
      onEdgesChange={onRawEdgesChange}
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

  const currentWorkflowData = useRecoilValue(currentWorkflowDataState);

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
          {currentWorkflowData === undefined ? null : (
            <LoadedWorkflow flowData={currentWorkflowData} />
          )}
        </StyledFlowContainer>
      </PageBody>
    </PageContainer>
  );
};
