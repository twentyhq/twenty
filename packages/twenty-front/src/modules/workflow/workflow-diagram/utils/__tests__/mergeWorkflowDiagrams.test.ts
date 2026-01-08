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
