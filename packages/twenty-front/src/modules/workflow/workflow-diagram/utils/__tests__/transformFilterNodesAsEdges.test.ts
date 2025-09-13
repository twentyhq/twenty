import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { transformFilterNodesAsEdges } from '../transformFilterNodesAsEdges';

describe('transformFilterNodesAsEdges', () => {
  it('should return the original diagram when there are no filter nodes', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: 'A',
          data: {
            nodeType: 'action',
            actionType: 'CODE',
            name: 'Step A',
            hasNextStepIds: false,
            position: { x: 0, y: 0 },
            stepId: 'A',
          },
          position: { x: 0, y: 0 },
        },
        {
          id: 'C',
          data: {
            nodeType: 'action',
            actionType: 'SEND_EMAIL',
            name: 'Step C',
            hasNextStepIds: false,
            position: { x: 0, y: 0 },
            stepId: 'C',
          },
          position: { x: 0, y: 300 },
        },
      ],
      edges: [
        {
          id: 'A-C',
          source: 'A',
          sourceHandle: 'default',
          target: 'C',
          targetHandle: 'default',
          data: {
            edgeType: 'default',
          },
        },
      ],
    };

    const result = transformFilterNodesAsEdges({
      nodes: diagram.nodes,
      edges: diagram.edges,
      workflowContext: 'workflow',
    });

    expect(result.nodes).toEqual(diagram.nodes);
    expect(result.edges).toEqual(diagram.edges);
  });

  it('should transform A->B->C where B is a FILTER step', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: 'A',
          data: {
            nodeType: 'action',
            actionType: 'CODE',
            name: 'Step A',
            hasNextStepIds: true,
            position: { x: 0, y: 0 },
            stepId: 'A',
          },
          position: { x: 0, y: 0 },
        },
        {
          id: 'B',
          data: {
            nodeType: 'action',
            actionType: 'FILTER',
            name: 'Filter B',
            hasNextStepIds: true,
            position: { x: 0, y: 150 },
            stepId: 'B',
          },
          position: { x: 0, y: 150 },
        },
        {
          id: 'C',
          data: {
            nodeType: 'action',
            actionType: 'SEND_EMAIL',
            name: 'Step C',
            hasNextStepIds: false,
            position: { x: 0, y: 300 },
            stepId: 'C',
          },
          position: { x: 0, y: 300 },
        },
      ],
      edges: [
        {
          id: 'A-B',
          source: 'A',
          sourceHandle: 'default',
          target: 'B',
          targetHandle: 'default',
          data: { edgeType: 'default' },
        },
        {
          id: 'B-C',
          source: 'B',
          sourceHandle: 'default',
          target: 'C',
          targetHandle: 'default',
          data: { edgeType: 'default' },
        },
      ],
    };

    const result = transformFilterNodesAsEdges({
      nodes: diagram.nodes,
      edges: diagram.edges,
      workflowContext: 'workflow',
    });

    // Should only have nodes A and C
    expect(result.nodes).toEqual([
      {
        id: 'A',
        data: {
          nodeType: 'action',
          actionType: 'CODE',
          name: 'Step A',
          hasNextStepIds: true,
          position: { x: 0, y: 0 },
          stepId: 'A',
        },
        position: { x: 0, y: 0 },
      },
      {
        id: 'C',
        data: {
          nodeType: 'action',
          actionType: 'SEND_EMAIL',
          name: 'Step C',
          hasNextStepIds: false,
          position: { x: 0, y: 300 },
          stepId: 'C',
        },
        position: { x: 0, y: 300 },
      },
    ]);

    // Should have one edge with filter data
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toEqual({
      id: 'A-C-filter-B',
      type: 'filter--editable',
      source: 'A',
      sourceHandle: 'default',
      target: 'C',
      targetHandle: 'default',
      selectable: true,
      deletable: true,
      data: {
        edgeType: 'filter',
        stepId: 'B',
        name: 'Filter B',
        runStatus: undefined,
        filterSettings: {},
      },
    });
  });

  it('should handle multiple filter nodes', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: 'A',
          data: {
            nodeType: 'action',
            actionType: 'CODE',
            name: 'Step A',
            hasNextStepIds: true,
            position: { x: 0, y: 0 },
            stepId: 'A',
          },
          position: { x: 0, y: 0 },
        },
        {
          id: 'B1',
          data: {
            nodeType: 'action',
            actionType: 'FILTER',
            name: 'Filter B1',
            hasNextStepIds: true,
            position: { x: 0, y: 150 },
            stepId: 'B1',
          },
          position: { x: 0, y: 150 },
        },
        {
          id: 'C',
          data: {
            nodeType: 'action',
            actionType: 'SEND_EMAIL',
            name: 'Step C',
            hasNextStepIds: true,
            position: { x: 0, y: 300 },
            stepId: 'C',
          },
          position: { x: 0, y: 300 },
        },
        {
          id: 'B2',
          data: {
            nodeType: 'action',
            actionType: 'FILTER',
            name: 'Filter B2',
            hasNextStepIds: true,
            position: { x: 0, y: 450 },
            stepId: 'B2',
          },
          position: { x: 0, y: 450 },
        },
        {
          id: 'D',
          data: {
            nodeType: 'action',
            actionType: 'CREATE_RECORD',
            name: 'Step D',
            hasNextStepIds: true,
            position: { x: 0, y: 600 },
            stepId: 'D',
          },
          position: { x: 0, y: 600 },
        },
      ],
      edges: [
        {
          id: 'A-B1',
          source: 'A',
          sourceHandle: 'default',
          target: 'B1',
          targetHandle: 'default',
          data: { edgeType: 'default' },
        },
        {
          id: 'B1-C',
          source: 'B1',
          sourceHandle: 'default',
          target: 'C',
          targetHandle: 'default',
          data: { edgeType: 'default' },
        },
        {
          id: 'C-B2',
          source: 'C',
          sourceHandle: 'default',
          target: 'B2',
          targetHandle: 'default',
          data: { edgeType: 'default' },
        },
        {
          id: 'B2-D',
          source: 'B2',
          sourceHandle: 'default',
          target: 'D',
          targetHandle: 'default',
          data: { edgeType: 'default' },
        },
      ],
    };

    const result = transformFilterNodesAsEdges({
      nodes: diagram.nodes,
      edges: diagram.edges,
      workflowContext: 'workflow',
    });

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
      type: 'filter--editable',
      source: 'A',
      sourceHandle: 'default',
      target: 'C',
      targetHandle: 'default',
      selectable: true,
      deletable: true,
      data: {
        edgeType: 'filter',
        name: 'Filter B1',
        runStatus: undefined,
        stepId: 'B1',
        filterSettings: {},
      },
    });

    const edgeCD = result.edges.find(
      (e) => e.source === 'C' && e.target === 'D',
    );
    expect(edgeCD).toEqual({
      id: 'C-D-filter-B2',
      type: 'filter--editable',
      source: 'C',
      sourceHandle: 'default',
      target: 'D',
      targetHandle: 'default',
      selectable: true,
      deletable: true,
      data: {
        edgeType: 'filter',
        name: 'Filter B2',
        runStatus: undefined,
        stepId: 'B2',
        filterSettings: {},
      },
    });
  });

  it('should handle filter nodes that are not part of a chain', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: 'A',
          data: {
            nodeType: 'action',
            actionType: 'CODE',
            name: 'Step A',
            hasNextStepIds: true,
            position: { x: 0, y: 0 },
            stepId: 'A',
          },
          position: { x: 0, y: 0 },
        },
        {
          id: 'B',
          data: {
            nodeType: 'action',
            actionType: 'FILTER',
            name: 'Filter B',
            hasNextStepIds: true,
            position: { x: 0, y: 150 },
            stepId: 'B',
          },
          position: { x: 0, y: 150 },
        },
      ],
      edges: [
        {
          id: 'A-B',
          source: 'A',
          sourceHandle: 'default',
          target: 'B',
          targetHandle: 'default',
          data: { edgeType: 'default' },
        },
      ],
    };

    const result = transformFilterNodesAsEdges({
      nodes: diagram.nodes,
      edges: diagram.edges,
      workflowContext: 'workflow',
    });

    // Should only have node A (filter node B is removed)
    expect(result.nodes).toEqual([
      {
        id: 'A',
        data: {
          nodeType: 'action',
          actionType: 'CODE',
          name: 'Step A',
          hasNextStepIds: true,
          position: { x: 0, y: 0 },
          stepId: 'A',
        },
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
            hasNextStepIds: true,
            position: { x: 0, y: 0 },
            stepId: 'trigger',
          },
          position: { x: 0, y: 0 },
        },
        {
          id: 'B',
          data: {
            nodeType: 'action',
            actionType: 'FILTER',
            name: 'Filter B',
            hasNextStepIds: true,
            position: { x: 0, y: 150 },
            stepId: 'B',
          },
          position: { x: 0, y: 150 },
        },
        {
          id: 'C',
          data: {
            nodeType: 'action',
            actionType: 'SEND_EMAIL',
            name: 'Step C',
            hasNextStepIds: true,
            position: { x: 0, y: 300 },
            stepId: 'C',
          },
          position: { x: 0, y: 300 },
        },
      ],
      edges: [
        {
          id: 'trigger-B',
          source: 'trigger',
          sourceHandle: 'default',
          target: 'B',
          targetHandle: 'default',
          data: { edgeType: 'default' },
        },
        {
          id: 'B-C',
          source: 'B',
          sourceHandle: 'default',
          target: 'C',
          targetHandle: 'default',
          data: { edgeType: 'default' },
        },
      ],
    };

    const result = transformFilterNodesAsEdges({
      nodes: diagram.nodes,
      edges: diagram.edges,
      workflowContext: 'workflow',
    });

    // Should have trigger and C nodes
    expect(result.nodes).toEqual([
      {
        id: 'trigger',
        data: {
          nodeType: 'trigger',
          triggerType: 'DATABASE_EVENT',
          name: 'Trigger',
          hasNextStepIds: true,
          position: { x: 0, y: 0 },
          stepId: 'trigger',
        },
        position: { x: 0, y: 0 },
      },
      {
        id: 'C',
        data: {
          nodeType: 'action',
          actionType: 'SEND_EMAIL',
          name: 'Step C',
          hasNextStepIds: true,
          position: { x: 0, y: 300 },
          stepId: 'C',
        },
        position: { x: 0, y: 300 },
      },
    ]);

    // Should have one edge with filter data
    expect(result.edges).toEqual([
      {
        id: 'trigger-C-filter-B',
        type: 'filter--editable',
        source: 'trigger',
        sourceHandle: 'default',
        target: 'C',
        targetHandle: 'default',
        selectable: true,
        deletable: true,
        data: {
          edgeType: 'filter',
          name: 'Filter B',
          runStatus: undefined,
          stepId: 'B',
          filterSettings: {},
        },
      },
    ]);
  });
});
