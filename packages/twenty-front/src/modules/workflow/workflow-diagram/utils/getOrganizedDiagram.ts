import {
  type WorkflowDiagram,
  type WorkflowDiagramEdge,
  type WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { Position } from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { isDefined } from 'twenty-shared/utils';

const layoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
  'elk.layered.nodePlacement.strategy': 'SIMPLE',
};

const elk = new ELK();

const adjustDiagramWithUniqueHandles = (
  diagram: WorkflowDiagram,
): WorkflowDiagram => {
  const adjustedEdges = diagram.edges.map((edge) => {
    const uniqueSourceHandle = `${edge.source}_${edge.sourceHandle}_source`;
    const uniqueTargetHandle = `${edge.target}_${edge.targetHandle}_target`;

    return {
      ...edge,
      sourceHandle: uniqueSourceHandle,
      targetHandle: uniqueTargetHandle,
    };
  });

  return {
    nodes: diagram.nodes,
    edges: adjustedEdges,
  };
};

type ElkNode = {
  id: string;
  width?: number;
  height?: number;
  properties?: Record<string, any>;
  ports?: any[];
  children?: ElkNode[];
};

const computeGraph = (
  graphId: string,
  nodes: WorkflowDiagramNode[],
  edges: WorkflowDiagramEdge[],
  checkedNodes = new Set<string>(),
): {
  id: string;
  layoutOptions: any;
  children: ElkNode[];
  edges: any[];
} => {
  const generateNodeChild = (
    node: WorkflowDiagramNode,
  ): ElkNode | undefined => {
    if (checkedNodes.has(node.id)) {
      return undefined;
    }

    checkedNodes.add(node.id);

    const targetEdges = edges.filter((edge) => edge.target === node.id);

    const targetPorts = targetEdges.map((edge) => {
      return {
        id: edge.targetHandle,
        properties: {
          side: 'NORTH',
        },
      };
    });

    const sourceEdges = edges.filter((edge) => edge.source === node.id);

    const sourcePorts = sourceEdges.map((edge) => {
      if (edge.data?.labelOptions?.position === Position.Right) {
        return {
          id: edge.sourceHandle,
          properties: {
            side: 'EAST',
          },
        };
      }

      return {
        id: edge.sourceHandle,
        properties: {
          side: 'SOUTH',
        },
      };
    });

    let children: ElkNode[] = [];
    if (
      node.data.nodeType === 'action' &&
      node.data.actionType === 'ITERATOR'
    ) {
      // Find all direct descendants (children) of this iterator node
      const descendantEdges = edges.filter((edge) => edge.source === node.id);
      const descendantNodeIds = descendantEdges.map((edge) => edge.target);
      const descendantNodes = nodes.filter((n) =>
        descendantNodeIds.includes(n.id),
      );

      // Recursively compute children for these nodes
      children = descendantNodes
        .map((descNode) => generateNodeChild(descNode))
        .filter(isDefined);
    }

    return {
      layoutOptions: {
        'elk.padding': '[left=5, top=90, right=5, bottom=10]',
      },

      id: node.id,
      data: node.data,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
      // ⚠️ we need to tell elk that the ports are fixed, in order to reduce edge crossings
      properties: {
        'org.eclipse.elk.portConstraints': 'FIXED_ORDER',
      },
      // we are also passing the id, so we can also handle edges without a sourceHandle or targetHandle option
      ports: [...targetPorts, ...sourcePorts],
      children,
    };
  };

  return {
    id: graphId,
    layoutOptions,
    children: nodes.map((node) => generateNodeChild(node)).filter(isDefined),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.sourceHandle],
      targets: [e.targetHandle],
    })),
  };
};

export const getOrganizedDiagram = async (
  diagram: WorkflowDiagram,
): Promise<WorkflowDiagram> => {
  const { nodes, edges } = adjustDiagramWithUniqueHandles(diagram);

  // const graph = {
  //   id: 'root',
  //   layoutOptions,
  //   children: nodes.map((node) => {
  //     const targetEdges = edges.filter((edge) => edge.target === node.id);

  //     const targetPorts = targetEdges.map((edge) => {
  //       return {
  //         id: edge.targetHandle,
  //         properties: {
  //           side: 'NORTH',
  //         },
  //       };
  //     });

  //     const sourceEdges = edges.filter((edge) => edge.source === node.id);

  //     const sourcePorts = sourceEdges.map((edge) => {
  //       if (edge.data?.labelOptions?.position === Position.Right) {
  //         return {
  //           id: edge.sourceHandle,
  //           properties: {
  //             side: 'EAST',
  //           },
  //         };
  //       }

  //       return {
  //         id: edge.sourceHandle,
  //         properties: {
  //           side: 'SOUTH',
  //         },
  //       };
  //     });

  //     return {
  //       id: node.id,
  //       width: node.measured.width,
  //       height: node.measured.height,
  //       // ⚠️ we need to tell elk that the ports are fixed, in order to reduce edge crossings
  //       properties: {
  //         'org.eclipse.elk.portConstraints': 'FIXED_ORDER',
  //       },
  //       // we are also passing the id, so we can also handle edges without a sourceHandle or targetHandle option
  //       ports: [...targetPorts, ...sourcePorts],
  //     };
  //   }),
  //   edges: edges.map((e) => ({
  //     id: e.id,
  //     sources: [e.sourceHandle],
  //     targets: [e.targetHandle],
  //   })),
  // };

  const graph = computeGraph('root', nodes, edges);

  console.group('graph', structuredClone(graph));

  const layoutedGraph = await elk.layout(graph);

  const allLayoutedChildren = layoutedGraph.children?.concat(
    layoutedGraph.children?.flatMap((child) => child.children ?? []) ?? [],
  );

  // console.group('layoutedGraph', layoutedGraph);

  const layoutedNodes = diagram.nodes.map((node) => {
    const layoutedNode = allLayoutedChildren?.find(
      (lgNode) => lgNode.id === node.id,
    );

    if (!isDefined(layoutedNode)) {
      throw new Error('Node must be defined in layoutGraph');
    }

    return {
      ...node,
      position: {
        x: layoutedNode.x ?? 0,
        y: layoutedNode.y ?? 0,
      },
    };
  });

  // console.log('layoutedNodes', structuredClone(layoutedNodes));

  return {
    nodes: layoutedNodes,
    edges: diagram.edges,
  };
};
