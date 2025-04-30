import { Edge, Node } from '@xyflow/react';

export const initialNodes: Node[] = [
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
  {
    id: '5',
    type: 'addNode',
    data: {},
    position: { x: 700, y: 900 },
  },
];

export const initialEdges: Edge[] = [
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
