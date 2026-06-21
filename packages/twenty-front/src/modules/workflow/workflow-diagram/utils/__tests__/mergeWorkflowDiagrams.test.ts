import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { mergeWorkflowDiagrams } from '@/workflow/workflow-diagram/utils/mergeWorkflowDiagrams';

it('Preserves the properties defined in the previous version but not in the next one', () => {
  const previousDiagram: WorkflowDiagram = {
    nodes: [
      {
        data: {
          nodeType: 'action',
          name: '',
          actionType: 'CODE',
          hasNextStepIds: false,
          position: { x: 0, y: 0 },
          stepId: '',
        },
        id: '1',
        position: { x: 0, y: 0 },
        selected: true,
      },
    ],
    edges: [],
  };
  const nextDiagram: WorkflowDiagram = {
    nodes: [
      {
        data: {
          nodeType: 'action',
          name: '',
          actionType: 'CODE',
          hasNextStepIds: false,
          position: { x: 0, y: 0 },
          stepId: '',
        },
        id: '1',
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
  };

  expect(mergeWorkflowDiagrams(previousDiagram, nextDiagram))
    .toMatchInlineSnapshot(`
{
  "edges": [],
  "nodes": [
    {
      "data": {
        "actionType": "CODE",
        "hasNextStepIds": false,
        "name": "",
        "nodeType": "action",
        "position": {
          "x": 0,
          "y": 0,
        },
        "stepId": "",
      },
      "id": "1",
      "measured": undefined,
      "position": {
        "x": 0,
        "y": 0,
      },
      "selected": true,
    },
  ],
}
`);
});

it('Replaces duplicated properties with the next value', () => {
  const previousDiagram: WorkflowDiagram = {
    nodes: [
      {
        data: {
          nodeType: 'action',
          name: '',
          actionType: 'CODE',
          hasNextStepIds: false,
          position: { x: 0, y: 0 },
          stepId: '',
        },
        id: '1',
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
  };
  const nextDiagram: WorkflowDiagram = {
    nodes: [
      {
        data: {
          nodeType: 'action',
          name: '2',
          actionType: 'CODE',
          hasNextStepIds: false,
          position: { x: 0, y: 0 },
          stepId: '',
        },
        id: '1',
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
  };

  expect(mergeWorkflowDiagrams(previousDiagram, nextDiagram))
    .toMatchInlineSnapshot(`
{
  "edges": [],
  "nodes": [
    {
      "data": {
        "actionType": "CODE",
        "hasNextStepIds": false,
        "name": "2",
        "nodeType": "action",
        "position": {
          "x": 0,
          "y": 0,
        },
        "stepId": "",
      },
      "id": "1",
      "measured": undefined,
      "position": {
        "x": 0,
        "y": 0,
      },
      "selected": undefined,
    },
  ],
}
`);
});

it('Preserves the local position of a node that is being dragged when the next diagram has a stale position', () => {
  const previousDiagram: WorkflowDiagram = {
    nodes: [
      {
        data: {
          nodeType: 'action',
          name: '',
          actionType: 'CODE',
          hasNextStepIds: false,
          position: { x: 120, y: 240 },
          stepId: '',
        },
        id: '1',
        position: { x: 120, y: 240 },
        dragging: true,
      },
    ],
    edges: [],
  };
  const nextDiagram: WorkflowDiagram = {
    nodes: [
      {
        data: {
          nodeType: 'action',
          name: '',
          actionType: 'CODE',
          hasNextStepIds: false,
          position: { x: 0, y: 0 },
          stepId: '',
        },
        id: '1',
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
  };

  const result = mergeWorkflowDiagrams(previousDiagram, nextDiagram);

  expect(result.nodes[0].position).toEqual({ x: 120, y: 240 });
  expect(result.nodes[0].dragging).toBe(true);
});

it('Uses the next position when the node is not being dragged', () => {
  const previousDiagram: WorkflowDiagram = {
    nodes: [
      {
        data: {
          nodeType: 'action',
          name: '',
          actionType: 'CODE',
          hasNextStepIds: false,
          position: { x: 120, y: 240 },
          stepId: '',
        },
        id: '1',
        position: { x: 120, y: 240 },
        dragging: false,
      },
    ],
    edges: [],
  };
  const nextDiagram: WorkflowDiagram = {
    nodes: [
      {
        data: {
          nodeType: 'action',
          name: '',
          actionType: 'CODE',
          hasNextStepIds: false,
          position: { x: 300, y: 400 },
          stepId: '',
        },
        id: '1',
        position: { x: 300, y: 400 },
      },
    ],
    edges: [],
  };

  const result = mergeWorkflowDiagrams(previousDiagram, nextDiagram);

  expect(result.nodes[0].position).toEqual({ x: 300, y: 400 });
});
