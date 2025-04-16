/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable no-constant-condition */
import { ExecuteFlow } from '@/chatbot/engine/executeFlow';
import { useGetChatbotFlowById } from '@/chatbot/hooks/useGetChatbotFlowById';
import { useUpdateChatbotFlow } from '@/chatbot/hooks/useUpdateChatbotFlow';
import { useValidateChatbotFlow } from '@/chatbot/hooks/useValidateChatbotFlow';
import { ChatbotFlowInput } from '@/chatbot/types/chatbotFlow.type';
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
    selected: false,
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    type: 'logicInput',
    data: {
      logic: {
        logicNodes: [0, 1],
        logicNodeData: [
          [
            { comparison: '==', inputText: '', conditionValue: '' },
            { comparison: '==', inputText: '', conditionValue: '||' },
          ],
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
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
    Node,
    Edge
  > | null>(null);

  const { chatbotFlow } = useValidateChatbotFlow();
  const { updateFlow } = useUpdateChatbotFlow();

  const { chatbotFlowData, refetch } = useGetChatbotFlowById(chatbotId);

  // eslint-disable-next-line @nx/workspace-no-state-useref
  const hasValidatedRef = useRef(false);

  type FlowType = () => [Node[], Edge[]];

  const defineFlow: FlowType = () => {
    if (
      chatbotFlowData &&
      Array.isArray(chatbotFlowData.nodes) &&
      chatbotFlowData.nodes.length > 0 &&
      Array.isArray(chatbotFlowData.edges) &&
      chatbotFlowData.edges.length > 0
    ) {
      return [chatbotFlowData.nodes, chatbotFlowData.edges];
    }

    return [initialNodes, initialEdges];
  };

  useEffect(() => {
    const [resNode, resEdges] = defineFlow();
    setNodes(resNode);
    setEdges(resEdges);
  }, [chatbotFlowData]);

  useEffect(() => {
    if (
      nodes.length > 0 &&
      edges.length > 0 &&
      chatbotId &&
      !hasValidatedRef.current
    ) {
      chatbotFlow({ nodes, edges, chatbotId });
      hasValidatedRef.current = true;
    }
  }, [nodes, edges, chatbotId]);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const newFlow = { ...flow, chatbotId };

      console.log('flow: ', flow);

      updateFlow(newFlow);
      refetch();
    }
  }, [rfInstance]);

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
      (flowBounds.width ?? 2) / 2;

    reactflow.setViewport(
      {
        ...currentViewport,
        x: viewportX - visibleRightDrawerWidth,
      },
      { duration: 300 },
    );
  }, [reactflow, rightDrawerState, rightDrawerWidth]);

  const chatbotFlowO: ChatbotFlowInput = {
    nodes,
    edges,
    chatbotId,
  };

  const flow = new ExecuteFlow(chatbotFlowO);
  flow.setIncomingMessage('geral');
  flow.runFlowWithLog();

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
