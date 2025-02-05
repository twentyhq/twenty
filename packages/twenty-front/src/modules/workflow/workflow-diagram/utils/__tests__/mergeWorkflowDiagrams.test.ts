import { WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { mergeWorkflowDiagrams } from '../mergeWorkflowDiagrams';
import { WorkflowActionType } from 'twenty-shared';

it('Preserves the properties defined in the previous version but not in the next one', () => {
  const previousDiagram: WorkflowDiagram = {
    nodes: [
      {
        data: {
          nodeType: 'action',
          name: '',
          actionType: WorkflowActionType.CODE,
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
          actionType: WorkflowActionType.CODE,
        },
        id: '1',
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
  };

  expect(mergeWorkflowDiagrams(previousDiagram, nextDiagram)).toEqual({
    nodes: [
      {
        data: {
          nodeType: 'action',
          name: '',
          actionType: WorkflowActionType.CODE,
        },
        id: '1',
        position: { x: 0, y: 0 },
        selected: true,
      },
    ],
    edges: [],
  });
});

it('Replaces duplicated properties with the next value', () => {
  const previousDiagram: WorkflowDiagram = {
    nodes: [
      {
        data: {
          nodeType: 'action',
          name: '',
          actionType: WorkflowActionType.CODE,
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
          actionType: WorkflowActionType.CODE,
        },
        id: '1',
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
  };

  expect(mergeWorkflowDiagrams(previousDiagram, nextDiagram)).toEqual({
    nodes: [
      {
        data: {
          nodeType: 'action',
          name: '2',
          actionType: WorkflowActionType.CODE,
        },
        id: '1',
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
  });
});
