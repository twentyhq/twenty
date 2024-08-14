import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import {
  Workflow,
  WorkflowAction,
  WorkflowTrigger,
} from '@/workflow/types/workflow';
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
import { useEffect, useMemo } from 'react';
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

const workflowTriggerToFlow = (trigger: WorkflowTrigger) => {
  const nodes: Array<Node<WorkflowNodeData>> = [];
  const edges: Array<Edge> = [];

  // Helper function to generate nodes and edges recursively
  const generateFlow = (
    action: WorkflowAction,
    parentNodeId: string,
    xPos: number,
    yPos: number,
  ) => {
    const nodeId = generateId();
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
      id: generateId(),
      source: parentNodeId,
      target: nodeId,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    });

    // Recursively generate flow for the next action if it exists
    if (action.nextAction !== undefined) {
      generateFlow(action.nextAction, nodeId, xPos + 150, yPos + 100);
    }
  };

  // Start with the trigger node
  const triggerNodeId = generateId();
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
  if (trigger.nextAction !== undefined) {
    generateFlow(trigger.nextAction, triggerNodeId, 150, 100);
  }

  return {
    nodes,
    edges,
  };
};

const LoadedWorkflow = ({ workflow }: { workflow: Workflow }) => {
  const { nodes: baseNodes, edges: baseEdges } = useMemo(() => {
    const lastVersion = workflow.versions[0];
    if (lastVersion === undefined || lastVersion.trigger === undefined) {
      return {
        nodes: [],
        edges: [],
      };
    }

    return workflowTriggerToFlow(lastVersion.trigger);
  }, [workflow]);

  const { nodes: nodesWithStepNodes, edges: edgesWithStepNodes } = useMemo(
    () => addCreateStepNodes(baseNodes, baseEdges),
    [baseNodes, baseEdges],
  );

  const [rawNodes, setRawNodes, onRawNodesChange] =
    useNodesState(nodesWithStepNodes);
  const [rawEdges, setRawEdges, onRawEdgesChange] =
    useEdgesState(edgesWithStepNodes);

  useEffect(() => {
    setRawNodes(nodesWithStepNodes);
    setRawEdges(edgesWithStepNodes);
  }, [nodesWithStepNodes, edgesWithStepNodes, setRawNodes, setRawEdges]);

  const { nodes, edges } = getLayoutedElements(rawNodes, rawEdges);

  return (
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
  );
};

export const WorkflowShowPage = () => {
  const parameters = useParams<{
    workflowId: string;
  }>();
  const workflowName = 'Test Workflow';

  const {
    record: workflow,
    loading,
    error,
  } = useFindOneRecord<Workflow>({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    objectRecordId: parameters.workflowId,
    recordGqlFields: {
      id: true,
      name: true,
      versions: true,
      publishedVersionId: true,
    },
  });

  return (
    <PageContainer>
      <PageTitle title={workflowName} />
      <WorkflowShowPageHeader
        workflowName={workflowName}
        headerIcon={IconSettingsAutomation}
      ></WorkflowShowPageHeader>
      <PageBody>
        <StyledFlowContainer>
          {workflow === undefined ? null : (
            <LoadedWorkflow workflow={workflow} />
          )}
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

  color: ${({ theme }) => theme.color.gray50};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};

  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  position: absolute;
  top: 0;
  transform: translateY(-100%);

  .selectable.selected &,
  .selectable:focus &,
  .selectable:focus-visible & {
    background-color: ${({ theme }) => theme.color.blue};
    color: ${({ theme }) => theme.font.color.inverted};
  }
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
    background-color: ${({ theme }) => theme.color.blue10};
    border-color: ${({ theme }) => theme.color.blue};
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
  background-color: ${({ theme }) => theme.color.gray50};
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
