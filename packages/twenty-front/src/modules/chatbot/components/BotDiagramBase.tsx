/* eslint-disable no-constant-condition */
import TextNode from '@/chatbot/components/ui/TextNode';
import { useTheme } from '@emotion/react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Edge,
  Node,
  NodeTypes,
  OnConnect,
  Panel,
  ReactFlow,
  ReactFlowInstance,
} from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from 'twenty-ui';

type BotDiagramBaseProps = {
  nodeTypes?: NodeTypes | null;
};

const types: NodeTypes = {
  textInput: TextNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'textInput',
    data: { nodeStart: true, text: '' },
    position: { x: 0, y: 0 },
  },
];

const initialEdges: Edge[] = [];

const flowKey = 'flow';

export const BotDiagramBase = ({ nodeTypes }: BotDiagramBaseProps) => {
  const theme = useTheme();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
    Node,
    Edge
  > | null>(null);

  const onSave = useCallback(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (rfInstance) {
      const flow = rfInstance.toObject();

      // change in future versions
      console.log('dataFlow: ', { flow });
      // localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  useEffect(() => {
    const storedFlow = localStorage.getItem(flowKey);

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (storedFlow) {
      const { nodes: storedNodes, edges: storedEdges } = JSON.parse(storedFlow);

      setNodes(storedNodes);
      setEdges(storedEdges);
    }
  }, []);

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

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={types}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={setRfInstance}
      fitViewOptions={{ padding: 2 }}
      fitView
      nodesDraggable={false}
    >
      <Background color={theme.border.color.medium} size={2} />
      <Panel>
        <Button accent="blue" title="Save" onClick={onSave} />
      </Panel>
    </ReactFlow>
  );
};
