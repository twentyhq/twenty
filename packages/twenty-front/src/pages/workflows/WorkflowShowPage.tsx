import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';

import { IconButton } from '@/ui/input/button/components/IconButton';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import Dagre from '@dagrejs/dagre';
import {
  Background,
  Edge,
  Handle,
  MarkerType,
  Node,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo } from 'react';
import { GRAY_SCALE, IconPlus, IconSettingsAutomation } from 'twenty-ui';
import { WorkflowShowPageHeader } from '~/pages/workflows/WorkflowShowPageHeader';

type WorkflowNodeData = {
  nodeType: 'trigger' | 'condition' | 'action';
  label: string;
};

const generateId = () => {
  return Math.random().toString(16).slice(2);
};

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

const addCreateStepNodes = (
  nodes: Array<Node<WorkflowNodeData>>,
  edges: Array<Edge>,
) => {
  const nodesWithoutTargets = nodes.filter((n) =>
    edges.every((e) => e.source !== n.id),
  );

  console.log({ nodesWithoutTargets });

  const updatedNodes: typeof nodes = nodes.slice();
  const updatedEdges: typeof edges = edges.slice();

  for (const n of nodesWithoutTargets) {
    const newCreateStepNode: Node<WorkflowNodeData> = {
      id: generateId(),
      type: 'create-step',
      data: {},
      position: { x: 0, y: 0 },
    };

    updatedNodes.push(newCreateStepNode);

    updatedEdges.push({
      id: generateId(),
      source: n.id,
      target: newCreateStepNode.id,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    });
  }

  console.log({ updatedNodes, updatedEdges });

  return {
    nodes: updatedNodes,
    edges: updatedEdges,
  };
};

const getLayoutedElements = (
  nodes: Array<Node<WorkflowNodeData>>,
  edges: Array<Edge>,
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB' });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

const initialNodes: Array<Node<WorkflowNodeData>> = [
  {
    id: '1',
    data: {
      nodeType: 'trigger',
      label: 'Person is Created',
    },
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    data: {
      nodeType: 'action',
      label: 'Find Stripe Customer',
    },
    position: { x: 0, y: 0 },
  },
  {
    id: '3',
    data: {
      nodeType: 'action',
      label: 'Update People',
    },
    position: { x: 0, y: 0 },
  },
  {
    id: '4',
    data: {
      nodeType: 'action',
      label: 'Split First & Last Name',
    },
    position: { x: 0, y: 0 },
  },
];
const initialEdges: Array<Edge> = [
  {
    id: 'edge-1',
    source: '1',
    target: '2',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'edge-2',
    source: '2',
    target: '3',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'edge-3',
    source: '2',
    target: '4',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];

export const WorkflowShowPage = () => {
  const { nodes: n, edges: e } = useMemo(
    () => addCreateStepNodes(initialNodes, initialEdges),
    [initialNodes, initialEdges],
  );

  const [rawNodes, setRawNodes, onRawNodesChange] = useNodesState(n);
  const [rawEdges, setRawEdges, onRawEdgesChange] = useEdgesState(e);

  const { nodes, edges } = getLayoutedElements(rawNodes, rawEdges);

  const parameters = useParams<{
    workflowId: string;
  }>();
  const workflowName = 'Test Workflow';

  return (
    <PageContainer>
      <PageTitle title={workflowName} />
      <WorkflowShowPageHeader
        workflowName={workflowName}
        headerIcon={IconSettingsAutomation}
      ></WorkflowShowPageHeader>
      <PageBody>
        <StyledFlowContainer>
          <ReactFlow
            nodeTypes={{
              default: StepNode,
              'create-step': CreateStepNode,
            }}
            fitView
            nodes={nodes.map((n) => ({ ...n, draggable: false }))}
            edges={edges}
            onNodesChange={onRawNodesChange}
            onEdgesChange={onRawEdgesChange}
          >
            <Background color={GRAY_SCALE.gray25} size={2} />
          </ReactFlow>
        </StyledFlowContainer>
      </PageBody>
    </PageContainer>
  );
};

const StyledStepNodeContainer = styled.div`
  display: flex;
  flex-direction: column;

  padding-bottom: 12px;
  padding-top: 6px;
`;

const StyledStepNodeType = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm}
    ${({ theme }) => theme.border.radius.sm} 0 0;

  color: #b3b3b3;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};

  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  position: absolute;
  top: 0;
  transform: translateY(-100%);
`;

const StyledStepNodeInnerContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};

  position: relative;
  box-shadow: ${({ theme }) => theme.boxShadow.superHeavy};

  .selectable.selected &,
  .selectable:focus &,
  .selectable:focus-visible & {
    box-shadow: ${({ theme }) => theme.boxShadow.strong};
  }
`;

const StyledStepNodeLabel = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledTargetHandle = styled(Handle)`
  visibility: hidden;
`;

const StyledSourceHandle = styled(Handle)`
  background-color: #b3b3b3;
`;

const StepNode = ({ data }: { data: WorkflowNodeData }) => {
  return (
    <StyledStepNodeContainer>
      {data.nodeType !== 'trigger' ? (
        <StyledTargetHandle type="target" position={Position.Top} />
      ) : null}

      <StyledStepNodeInnerContainer>
        <StyledStepNodeType>{data.nodeType}</StyledStepNodeType>

        <StyledStepNodeLabel>{data.label}</StyledStepNodeLabel>
      </StyledStepNodeInnerContainer>

      <StyledSourceHandle type="source" position={Position.Bottom} />
    </StyledStepNodeContainer>
  );
};

const CreateStepNode = () => {
  return (
    <div>
      <StyledTargetHandle type="target" position={Position.Top} />

      <IconButton Icon={IconPlus} />
    </div>
  );
};
