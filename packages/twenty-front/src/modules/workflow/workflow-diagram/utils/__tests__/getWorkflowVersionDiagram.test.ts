import { getUuidV4Mock } from '~/testing/utils/getUuidV4Mock';
import { getWorkflowVersionDiagram } from '../getWorkflowVersionDiagram';

jest.mock('uuid', () => ({
  v4: getUuidV4Mock(),
}));

describe('getWorkflowVersionDiagram', () => {
  it('returns an empty diagram if the provided workflow version', () => {
    const result = getWorkflowVersionDiagram({
      workflowVersion: undefined,
      isEditable: true,
      isWorkflowFilteringEnabled: true,
    });

    expect(result).toMatchInlineSnapshot(`
{
  "edges": [],
  "nodes": [],
}
`);
  });

  it('returns a diagram with an empty-trigger node if the provided workflow version has no trigger', () => {
    const result = getWorkflowVersionDiagram({
      workflowVersion: {
        __typename: 'WorkflowVersion',
        status: 'ACTIVE',
        createdAt: '',
        id: '1',
        name: '',
        steps: [],
        trigger: null,
        updatedAt: '',
        workflowId: '',
      },
      isEditable: true,
      isWorkflowFilteringEnabled: true,
    });

    expect(result).toMatchInlineSnapshot(`
{
  "edges": [],
  "nodes": [
    {
      "data": {
        "nodeType": "empty-trigger",
      },
      "id": "trigger",
      "position": {
        "x": 0,
        "y": 0,
      },
      "type": "empty-trigger",
    },
  ],
}
`);
  });

  it('returns a diagram with only a trigger node if the provided workflow version has no steps', () => {
    const result = getWorkflowVersionDiagram({
      workflowVersion: {
        __typename: 'WorkflowVersion',
        status: 'ACTIVE',
        createdAt: '',
        id: '1',
        name: '',
        steps: null,
        trigger: {
          name: 'Record is created',
          settings: { eventName: 'company.created', outputSchema: {} },
          type: 'DATABASE_EVENT',
        },
        updatedAt: '',
        workflowId: '',
      },
      isEditable: true,
      isWorkflowFilteringEnabled: true,
    });

    expect(result).toMatchInlineSnapshot(`
{
  "edges": [],
  "nodes": [
    {
      "data": {
        "icon": "IconPlaylistAdd",
        "name": "Record is created",
        "nodeType": "trigger",
        "triggerType": "DATABASE_EVENT",
      },
      "id": "trigger",
      "position": {
        "x": 0,
        "y": 0,
      },
    },
  ],
}
`);
  });

  it('returns the diagram for the last version', () => {
    const result = getWorkflowVersionDiagram({
      workflowVersion: {
        __typename: 'WorkflowVersion',
        status: 'ACTIVE',
        createdAt: '',
        id: '1',
        name: '',
        steps: [
          {
            id: 'step-1',
            name: '',
            settings: {
              errorHandlingOptions: {
                retryOnFailure: { value: true },
                continueOnFailure: { value: false },
              },
              input: {
                serverlessFunctionId: 'a5434be2-c10b-465c-acec-46492782a997',
                serverlessFunctionVersion: '1',
                serverlessFunctionInput: {},
              },
              outputSchema: {},
            },
            type: 'CODE',
            valid: true,
          },
        ],
        trigger: {
          name: 'Company created',
          settings: { eventName: 'company.created', outputSchema: {} },
          type: 'DATABASE_EVENT',
        },
        updatedAt: '',
        workflowId: '',
      },
      isEditable: true,
      isWorkflowFilteringEnabled: true,
    });

    expect(result).toMatchInlineSnapshot(`
{
  "edges": [
    {
      "data": {
        "edgeType": "default",
      },
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-0",
      "markerEnd": "workflow-edge-arrow-rounded",
      "markerStart": "workflow-edge-gray-circle",
      "selectable": false,
      "source": "trigger",
      "target": "step-1",
      "type": "empty-filter--editable",
    },
  ],
  "nodes": [
    {
      "data": {
        "icon": "IconPlaylistAdd",
        "name": "Company created",
        "nodeType": "trigger",
        "triggerType": "DATABASE_EVENT",
      },
      "id": "trigger",
      "position": {
        "x": 0,
        "y": 0,
      },
    },
    {
      "data": {
        "actionType": "CODE",
        "name": "",
        "nodeType": "action",
      },
      "id": "step-1",
      "position": {
        "x": 0,
        "y": 150,
      },
    },
  ],
}
`);
  });
});
