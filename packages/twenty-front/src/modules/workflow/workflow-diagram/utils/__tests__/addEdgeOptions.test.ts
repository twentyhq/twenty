import { WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { addEdgeOptions } from '../addEdgeOptions';

describe('addEdgeOptions', () => {
  it('should add shouldDisplayEdgeOptions to all edges', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: 'trigger',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'trigger',
            triggerType: 'DATABASE_EVENT',
            name: 'Company Created',
            icon: 'IconPlus',
          },
        },
        {
          id: 'action-1',
          position: { x: 0, y: 100 },
          data: {
            nodeType: 'action',
            actionType: 'CREATE_RECORD',
            name: 'Create Company',
          },
        },
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'trigger',
          target: 'action-1',
          data: {
            shouldDisplayEdgeOptions: true,
          },
        },
        {
          id: 'edge-2',
          source: 'action-1',
          target: 'action-2',
          data: {},
        },
      ],
    };

    const result = addEdgeOptions(diagram);

    expect(result.nodes).toEqual(diagram.nodes);
    expect(result.edges).toHaveLength(2);

    expect(result.edges[0]).toEqual({
      id: 'edge-1',
      source: 'trigger',
      target: 'action-1',
      data: {
        shouldDisplayEdgeOptions: true,
      },
    });

    expect(result.edges[1]).toEqual({
      id: 'edge-2',
      source: 'action-1',
      target: 'action-2',
      data: {
        shouldDisplayEdgeOptions: true,
      },
    });
  });

  it('should handle empty edges array', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: 'trigger',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'trigger',
            triggerType: 'DATABASE_EVENT',
            name: 'Company Created',
            icon: 'IconPlus',
          },
        },
      ],
      edges: [],
    };

    const result = addEdgeOptions(diagram);

    expect(result.nodes).toEqual(diagram.nodes);
    expect(result.edges).toEqual([]);
  });

  it('should handle edges without existing data property', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: 'trigger',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'trigger',
            triggerType: 'MANUAL',
            name: 'Manual Trigger',
            icon: 'IconClick',
          },
        },
        {
          id: 'action-1',
          position: { x: 0, y: 100 },
          data: {
            nodeType: 'action',
            actionType: 'SEND_EMAIL',
            name: 'Send Email',
          },
        },
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'trigger',
          target: 'action-1',
        } as any,
      ],
    };

    const result = addEdgeOptions(diagram);

    expect(result.edges[0]).toEqual({
      id: 'edge-1',
      source: 'trigger',
      target: 'action-1',
      data: {
        shouldDisplayEdgeOptions: true,
      },
    });
  });
});
