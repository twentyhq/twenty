import { WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { transformFilterNodesAsEdges } from '../transformFilterNodesAsEdges';

describe('transformFilterNodesAsEdges', () => {
  it('should return the original diagram when there are no filter nodes', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: 'A',
          data: { nodeType: 'action', actionType: 'CODE', name: 'Step A' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'C',
          data: {
            nodeType: 'action',
            actionType: 'SEND_EMAIL',
            name: 'Step C',
          },
          position: { x: 0, y: 300 },
        },
      ],
      edges: [
        {
          id: 'A-C',
          source: 'A',
          target: 'C',
          data: { stepId: 'A', shouldDisplayEdgeOptions: true },
        },
      ],
    };

    const result = transformFilterNodesAsEdges(diagram);

    expect(result.nodes).toEqual(diagram.nodes);
    expect(result.edges).toEqual(diagram.edges);
  });

  it('should transform A->B->C where B is a FILTER step', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: 'A',
          data: { nodeType: 'action', actionType: 'CODE', name: 'Step A' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'B',
          data: { nodeType: 'action', actionType: 'FILTER', name: 'Filter B' },
          position: { x: 0, y: 150 },
        },
        {
          id: 'C',
          data: {
            nodeType: 'action',
            actionType: 'SEND_EMAIL',
            name: 'Step C',
          },
          position: { x: 0, y: 300 },
        },
      ],
      edges: [
        {
          id: 'A-B',
          source: 'A',
          target: 'B',
          data: { stepId: 'A', shouldDisplayEdgeOptions: true },
        },
        {
          id: 'B-C',
          source: 'B',
          target: 'C',
          data: { stepId: 'B', shouldDisplayEdgeOptions: true },
        },
      ],
    };

    const result = transformFilterNodesAsEdges(diagram);

    // Should only have nodes A and C
    expect(result.nodes).toEqual([
      {
        id: 'A',
        data: { nodeType: 'action', actionType: 'CODE', name: 'Step A' },
        position: { x: 0, y: 0 },
      },
      {
        id: 'C',
        data: { nodeType: 'action', actionType: 'SEND_EMAIL', name: 'Step C' },
        position: { x: 0, y: 300 },
      },
    ]);

    // Should have one edge with filter data
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toEqual({
      id: 'A-C-filter-B',
      source: 'A',
      target: 'C',
      data: {
        shouldDisplayEdgeOptions: true,
        stepId: 'B',
        filter: { nodeType: 'action', actionType: 'FILTER', name: 'Filter B' },
      },
    });
  });

  it('should handle multiple filter nodes', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: 'A',
          data: { nodeType: 'action', actionType: 'CODE', name: 'Step A' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'B1',
          data: { nodeType: 'action', actionType: 'FILTER', name: 'Filter B1' },
          position: { x: 0, y: 150 },
        },
        {
          id: 'C',
          data: {
            nodeType: 'action',
            actionType: 'SEND_EMAIL',
            name: 'Step C',
          },
          position: { x: 0, y: 300 },
        },
        {
          id: 'B2',
          data: { nodeType: 'action', actionType: 'FILTER', name: 'Filter B2' },
          position: { x: 0, y: 450 },
        },
        {
          id: 'D',
          data: {
            nodeType: 'action',
            actionType: 'CREATE_RECORD',
            name: 'Step D',
          },
          position: { x: 0, y: 600 },
        },
      ],
      edges: [
        {
          id: 'A-B1',
          source: 'A',
          target: 'B1',
          data: { stepId: 'A', shouldDisplayEdgeOptions: true },
        },
        {
          id: 'B1-C',
          source: 'B1',
          target: 'C',
          data: { stepId: 'B1', shouldDisplayEdgeOptions: true },
        },
        {
          id: 'C-B2',
          source: 'C',
          target: 'B2',
          data: { stepId: 'C', shouldDisplayEdgeOptions: true },
        },
        {
          id: 'B2-D',
          source: 'B2',
          target: 'D',
          data: { stepId: 'B2', shouldDisplayEdgeOptions: true },
        },
      ],
    };

    const result = transformFilterNodesAsEdges(diagram);

    // Should only have nodes A, C, and D
    expect(result.nodes).toHaveLength(3);
    expect(result.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining(['A', 'C', 'D']),
    );

    // Should have two edges with filter data
    expect(result.edges).toHaveLength(2);

    const edgeAC = result.edges.find(
      (e) => e.source === 'A' && e.target === 'C',
    );
    expect(edgeAC).toEqual({
      id: 'A-C-filter-B1',
      source: 'A',
      target: 'C',
      data: {
        stepId: 'B1',
        shouldDisplayEdgeOptions: true,
        filter: { nodeType: 'action', actionType: 'FILTER', name: 'Filter B1' },
      },
    });

    const edgeCD = result.edges.find(
      (e) => e.source === 'C' && e.target === 'D',
    );
    expect(edgeCD).toEqual({
      id: 'C-D-filter-B2',
      source: 'C',
      target: 'D',
      data: {
        stepId: 'B2',
        shouldDisplayEdgeOptions: true,
        filter: { nodeType: 'action', actionType: 'FILTER', name: 'Filter B2' },
      },
    });
  });

  it('should handle filter nodes that are not part of a chain', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: 'A',
          data: { nodeType: 'action', actionType: 'CODE', name: 'Step A' },
          position: { x: 0, y: 0 },
        },
        {
          id: 'B',
          data: { nodeType: 'action', actionType: 'FILTER', name: 'Filter B' },
          position: { x: 0, y: 150 },
        },
      ],
      edges: [
        {
          id: 'A-B',
          source: 'A',
          target: 'B',
          data: { stepId: 'A', shouldDisplayEdgeOptions: true },
        },
      ],
    };

    const result = transformFilterNodesAsEdges(diagram);

    // Should only have node A (filter node B is removed)
    expect(result.nodes).toEqual([
      {
        id: 'A',
        data: { nodeType: 'action', actionType: 'CODE', name: 'Step A' },
        position: { x: 0, y: 0 },
      },
    ]);

    // Should have no edges (original edge A-B is removed, no new edges created)
    expect(result.edges).toEqual([]);
  });

  it('should preserve trigger nodes', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: 'trigger',
          data: {
            nodeType: 'trigger',
            triggerType: 'DATABASE_EVENT',
            name: 'Trigger',
          },
          position: { x: 0, y: 0 },
        },
        {
          id: 'B',
          data: { nodeType: 'action', actionType: 'FILTER', name: 'Filter B' },
          position: { x: 0, y: 150 },
        },
        {
          id: 'C',
          data: {
            nodeType: 'action',
            actionType: 'SEND_EMAIL',
            name: 'Step C',
          },
          position: { x: 0, y: 300 },
        },
      ],
      edges: [
        {
          id: 'trigger-B',
          source: 'trigger',
          target: 'B',
          data: { stepId: 'trigger', shouldDisplayEdgeOptions: true },
        },
        {
          id: 'B-C',
          source: 'B',
          target: 'C',
          data: { stepId: 'B', shouldDisplayEdgeOptions: true },
        },
      ],
    };

    const result = transformFilterNodesAsEdges(diagram);

    // Should have trigger and C nodes
    expect(result.nodes).toEqual([
      {
        id: 'trigger',
        data: {
          nodeType: 'trigger',
          triggerType: 'DATABASE_EVENT',
          name: 'Trigger',
        },
        position: { x: 0, y: 0 },
      },
      {
        id: 'C',
        data: { nodeType: 'action', actionType: 'SEND_EMAIL', name: 'Step C' },
        position: { x: 0, y: 300 },
      },
    ]);

    // Should have one edge with filter data
    expect(result.edges).toEqual([
      {
        id: 'trigger-C-filter-B',
        source: 'trigger',
        target: 'C',
        data: {
          stepId: 'B',
          shouldDisplayEdgeOptions: true,
          filter: {
            nodeType: 'action',
            actionType: 'FILTER',
            name: 'Filter B',
          },
        },
      },
    ]);
  });
});
