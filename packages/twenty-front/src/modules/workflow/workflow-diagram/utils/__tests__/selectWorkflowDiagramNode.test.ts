import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { selectWorkflowDiagramNode } from '@/workflow/workflow-diagram/utils/selectWorkflowDiagramNode';

describe('selectWorkflowDiagramNode', () => {
  it('should select the specified node', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: '1',
          selected: false,
          position: { x: 0, y: 0 },
          data: {
            name: 'Node 1',
            nodeType: 'action',
            actionType: 'CODE',
            hasNextStepIds: false,
            position: { x: 0, y: 0 },
            stepId: '1',
          },
        },
        {
          id: '2',
          selected: false,
          position: { x: 0, y: 150 },
          data: {
            name: 'Node 2',
            nodeType: 'action',
            actionType: 'CODE',
            hasNextStepIds: false,
            position: { x: 0, y: 150 },
            stepId: '2',
          },
        },
      ],
      edges: [],
    };

    const result = selectWorkflowDiagramNode({
      diagram,
      nodeIdToSelect: '1',
    });

    expect(result.nodes[0].selected).toBe(true);
    expect(result.nodes[1].selected).toBe(false);
  });

  it('should return same diagram when node is not found', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: '1',
          selected: false,
          position: { x: 0, y: 0 },
          data: {
            name: 'Node 1',
            nodeType: 'action',
            actionType: 'CODE',
            hasNextStepIds: false,
            position: { x: 0, y: 0 },
            stepId: '1',
          },
        },
      ],
      edges: [],
    };

    const result = selectWorkflowDiagramNode({
      diagram,
      nodeIdToSelect: 'non-existent',
    });

    expect(result).toEqual(diagram);
  });

  it('should not mutate original diagram', () => {
    const diagram: WorkflowDiagram = {
      nodes: [
        {
          id: '1',
          selected: false,
          position: { x: 0, y: 0 },
          data: {
            name: 'Node 1',
            nodeType: 'action',
            actionType: 'CODE',
            hasNextStepIds: false,
            position: { x: 0, y: 0 },
            stepId: '1',
          },
        },
      ],
      edges: [],
    };
    const originalDiagram = JSON.parse(JSON.stringify(diagram));

    selectWorkflowDiagramNode({
      diagram,
      nodeIdToSelect: '1',
    });

    expect(diagram).toEqual(originalDiagram);
  });
});
