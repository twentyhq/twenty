/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Edge,
  Node,
  OnConnect,
  Panel,
  ReactFlow,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from 'react';

const initialNodes: any[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 0, y: 0 },
  },
];

const initialEdges: Edge[] = [];

const flowKey = 'flow';

export const ChatbotFlow = (targetableObject: any) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<
    Node,
    Edge
  > | null>(null);

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

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();

      // change in future versions
      console.log('dataFlow: ', { targetableObject, flow });
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  useEffect(() => {
    const storedFlow = localStorage.getItem(flowKey);

    if (storedFlow) {
      const { nodes: storedNodes, edges: storedEdges } = JSON.parse(storedFlow);

      setNodes(storedNodes);
      setEdges(storedEdges);
    }
  }, []);

  return (
    <div className="test" style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        fitViewOptions={{ padding: 2 }}
        colorMode="light"
        fitView
      >
        <Background />
        <Panel>
          <button onClick={onSave}>save</button>
        </Panel>
        <Controls />
      </ReactFlow>
    </div>
  );
};
