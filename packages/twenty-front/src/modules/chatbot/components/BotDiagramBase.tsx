/* eslint-disable no-constant-condition */
import { useGetChatbotFlowById } from '@/chatbot/hooks/useGetChatbotFlowById';
import { useUpdateChatbotFlow } from '@/chatbot/hooks/useUpdateChatbotFlow';
import { useValidateChatbotFlow } from '@/chatbot/hooks/useValidateChatbotFlow';
import { WorkflowDiagramCustomMarkers } from '@/workflow/workflow-diagram/components/WorkflowDiagramCustomMarkers';
import { useRightDrawerState } from '@/workflow/workflow-diagram/hooks/useRightDrawerState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Edge,
  Node,
  NodeTypes,
  OnConnect,
  ReactFlow,
  ReactFlowInstance,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared';
import { Button, Tag, TagColor, THEME_COMMON } from 'twenty-ui';

type BotDiagramBaseProps = {
  nodeTypes: NodeTypes;
  tagColor: TagColor;
  tagText: string;
  chatbotId: string;
};

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
    width: auto;
    text-align: start;
    white-space: nowrap;
  }

  .react-flow__handle {
    min-height: 0;
    min-width: 0;
  }
  .react-flow__handle-top {
    transform: translate(-50%, -50%);
  }
  .react-flow__handle-bottom {
    transform: translate(-50%, 100%);
  }
  .react-flow__handle.connectionindicator {
    cursor: pointer;
  }

  --xy-node-border-radius: none;
  --xy-node-border: none;
  --xy-node-background-color: none;
  --xy-node-boxshadow-hover: none;
  --xy-node-boxshadow-selected: none;
`;

const StyledStatusTagContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  left: 0;
  padding: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  top: 0;
`;

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'textInput',
    data: {
      nodeStart: true,
      title: 'Mensagem Inicial',
      outgoingEdgeId: '',
    },
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    type: 'logicInput',
    data: {
      logic: {
        logicNodes: [0, 1],
        logicNodeData: [
          [{ comparison: '==', inputText: '', conditionValue: '' }],
          [{ comparison: '==', inputText: '', conditionValue: '' }],
        ],
      },
    },
    position: { x: 150, y: 150 },
  },
  {
    id: '3',
    type: 'textInput',
    data: { nodeStart: false, title: 'Mensagem' },
    position: { x: 500, y: 300 },
  },
  {
    id: '4',
    type: 'textInput',
    data: { nodeStart: false, title: 'Mensagem' },
    position: { x: 500, y: 600 },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'xy-edge__1-2',
    source: '1',
    target: '2',
  },
  {
    id: 'xy-edge__2b-0-3',
    source: '2',
    target: '3',
    sourceHandle: 'b-0',
  },
  {
    id: 'xy-edge__2b-1-4',
    source: '2',
    target: '4',
    sourceHandle: 'b-1',
  },
];

export const BotDiagramBase = ({
  nodeTypes,
  tagColor,
  tagText,
  chatbotId,
}: BotDiagramBaseProps) => {
  const theme = useTheme();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
    Node,
    Edge
  > | null>(null);

  const { chatbotFlow } = useValidateChatbotFlow();
  const { updateFlow } = useUpdateChatbotFlow();
  const { data: chatbotFlowData, refetch } = useGetChatbotFlowById(chatbotId);

  useEffect(() => {
    const flow = { nodes, edges, chatbotId };
    chatbotFlow(flow);
  }, []);

  const onSave = useCallback(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const newFlow = { ...flow, chatbotId };

      updateFlow(newFlow);
      refetch();
    }
  }, [rfInstance]);

  // useEffect(() => {
  //   // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
  //   if (chatbotFlowData) {
  //     const { nodes: storedNodes, edges: storedEdges } = JSON.parse(chatbotFlowData);

  //     setNodes(storedNodes);
  //     setEdges(storedEdges);
  //   }
  // }, [chatbotFlowData]);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const reactflow = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const { rightDrawerState } = useRightDrawerState();
  const rightDrawerWidth = Number(
    THEME_COMMON.rightDrawerWidth.replace('px', ''),
  );

  useEffect(() => {
    if (!isDefined(containerRef.current) || !reactflow.viewportInitialized) {
      return;
    }

    const currentViewport = reactflow.getViewport();

    const flowBounds = reactflow.getNodesBounds(reactflow.getNodes());

    let visibleRightDrawerWidth = 0;
    if (rightDrawerState === 'normal') {
      visibleRightDrawerWidth = rightDrawerWidth;
    }

    const viewportX =
      (containerRef.current.offsetWidth + visibleRightDrawerWidth) / 2 -
      flowBounds.width / 2;

    reactflow.setViewport(
      {
        ...currentViewport,
        x: viewportX - visibleRightDrawerWidth,
      },
      { duration: 300 },
    );
  }, [reactflow, rightDrawerState, rightDrawerWidth]);

  return (
    <StyledResetReactflowStyles ref={containerRef}>
      <WorkflowDiagramCustomMarkers />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        fitViewOptions={{ padding: 2 }}
        fitView
        // nodesDraggable={false}
      >
        <Background color={theme.border.color.medium} size={2} />
      </ReactFlow>

      <StyledStatusTagContainer data-testid={'tagContainerBotDiagram'}>
        <Tag color={tagColor} text={tagText} />
        <Button accent="blue" title="Save" onClick={onSave} />
      </StyledStatusTagContainer>
    </StyledResetReactflowStyles>
  );
};
