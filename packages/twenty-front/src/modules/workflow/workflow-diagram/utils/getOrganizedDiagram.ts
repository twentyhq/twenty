import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { WORKFLOW_DIAGRAM_ITERATOR_NODE_LOOP_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramIteratorNodeLoopHandleId';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultSourceHandleId';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultTargetHandleId';
import ELK from 'elkjs/lib/elk.bundled.js';

const layoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.layered.spacing.edgeNodeBetweenLayers': '40',
  'elk.spacing.nodeNode': '40',
  'elk.layered.nodePlacement.strategy': 'SIMPLE',
};

const elk = new ELK();

export const getOrganizedDiagram = async (
  diagram: WorkflowDiagram,
): Promise<WorkflowDiagram> => {
  const graph = {
    id: 'root',
    layoutOptions,
    children: diagram.nodes.map((n) => {
      const targetPorts = [
        ...(n.data.nodeType === 'trigger'
          ? []
          : [
              {
                id: WORKFLOW_DIAGRAM_NODE_DEFAULT_TARGET_HANDLE_ID,
                properties: {
                  side: 'NORTH',
                },
              },
            ]),
      ];

      const sourcePorts = [
        {
          id: WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID,
          properties: {
            side: 'SOUTH',
          },
        },
        ...(n.data.nodeType === 'action' && n.data.actionType === 'ITERATOR'
          ? [
              {
                id: WORKFLOW_DIAGRAM_ITERATOR_NODE_LOOP_HANDLE_ID,
                properties: {
                  side: 'EAST',
                },
              },
            ]
          : []),
      ];

      return {
        id: n.id,
        width: n.width ?? 150,
        height: n.height ?? 50,
        // ⚠️ we need to tell elk that the ports are fixed, in order to reduce edge crossings
        properties: {
          'org.eclipse.elk.portConstraints': 'FIXED_ORDER',
        },
        // we are also passing the id, so we can also handle edges without a sourceHandle or targetHandle option
        ports: [...targetPorts, ...sourcePorts],
      };
    }),
    edges: diagram.edges.map((e) => ({
      id: e.id,
      sources: [e.sourceHandle || e.source],
      targets: [e.targetHandle || e.target],
    })),
  };

  console.log('graph', structuredClone(graph));

  const layoutedGraph = await elk.layout(graph);

  console.log('layoutedGraph', layoutedGraph);

  const layoutedNodes = diagram.nodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find(
      (lgNode) => lgNode.id === node.id,
    );

    return {
      ...node,
      position: {
        x: layoutedNode?.x ?? 0,
        y: layoutedNode?.y ?? 0,
      },
    };
  });

  console.log('layoutedNodes', structuredClone(layoutedNodes));

  return {
    nodes: layoutedNodes,
    edges: diagram.edges,
  };

  // const graph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  // graph.setGraph({
  //   ranksep: 80, // Vertical distance between 2 nodes
  //   nodesep: 200, // Horizontal distance between 2 nodes
  //   rankdir: 'TB',
  // });

  // diagram.edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
  // diagram.nodes.forEach((node) =>
  //   graph.setNode(node.id, {
  //     width: node.measured?.width ?? 0,
  //     height: node.measured?.height ?? 0,
  //   }),
  // );

  // Dagre.layout(graph);

  // return {
  //   nodes: diagram.nodes.map((node) => {
  //     const position = graph.node(node.id);

  //     // We are shifting the dagre node position (anchor=center center) to the top left
  //     // so it matches the React Flow node anchor point (top left).
  //     const x = position.x - position.width / 2;
  //     const y = position.y - position.height / 2;

  //     return { ...node, position: { x, y } };
  //   }),
  //   edges: diagram.edges,
  // };
};
