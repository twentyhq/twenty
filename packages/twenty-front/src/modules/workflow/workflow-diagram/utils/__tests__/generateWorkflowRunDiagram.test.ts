import {
  WorkflowRunOutputStepsOutput,
  WorkflowStep,
  WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { getUuidV4Mock } from '~/testing/utils/getUuidV4Mock';
import { generateWorkflowRunDiagram } from '../generateWorkflowRunDiagram';

jest.mock('uuid', () => ({
  v4: getUuidV4Mock(),
}));

describe('generateWorkflowRunDiagram', () => {
  it('marks node as failed when not at least one attempt is in output', () => {
    const trigger: WorkflowTrigger = {
      name: 'Company created',
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
    };
    const steps: WorkflowStep[] = [
      {
        id: 'step1',
        name: 'Step 1',
        type: 'CODE',
        valid: true,
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
      },
      {
        id: 'step2',
        name: 'Step 2',
        type: 'CODE',
        valid: true,
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
      },
      {
        id: 'step3',
        name: 'Step 3',
        type: 'CODE',
        valid: true,
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
      },
    ];
    const stepsOutput: WorkflowRunOutputStepsOutput = {
      step1: {
        id: 'step1',
        outputs: [],
      },
    };

    const result = generateWorkflowRunDiagram({ trigger, steps, stepsOutput });

    expect(result).toMatchInlineSnapshot(`
{
  "edges": [
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-0",
      "markerEnd": "workflow-edge-green-arrow-rounded",
      "markerStart": "workflow-edge-green-circle",
      "selectable": false,
      "source": "trigger",
      "target": "step1",
      "type": "success",
    },
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-1",
      "markerEnd": "workflow-edge-arrow-rounded",
      "markerStart": "workflow-edge-gray-circle",
      "selectable": false,
      "source": "step1",
      "target": "step2",
    },
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-2",
      "markerEnd": "workflow-edge-arrow-rounded",
      "markerStart": "workflow-edge-gray-circle",
      "selectable": false,
      "source": "step2",
      "target": "step3",
    },
  ],
  "nodes": [
    {
      "data": {
        "icon": "IconPlaylistAdd",
        "isLeafNode": false,
        "name": "Company created",
        "nodeType": "trigger",
        "runStatus": "success",
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
        "isLeafNode": false,
        "name": "Step 1",
        "nodeType": "action",
        "runStatus": "failure",
      },
      "id": "step1",
      "position": {
        "x": 0,
        "y": 0,
      },
    },
    {
      "data": {
        "actionType": "CODE",
        "isLeafNode": false,
        "name": "Step 2",
        "nodeType": "action",
        "runStatus": "not-executed",
      },
      "id": "step2",
      "position": {
        "x": 0,
        "y": 150,
      },
    },
    {
      "data": {
        "actionType": "CODE",
        "isLeafNode": false,
        "name": "Step 3",
        "nodeType": "action",
        "runStatus": "not-executed",
      },
      "id": "step3",
      "position": {
        "x": 0,
        "y": 300,
      },
    },
  ],
}
`);
  });

  it('marks node as failed when the last attempt failed', () => {
    const trigger: WorkflowTrigger = {
      name: 'Company created',
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
    };
    const steps: WorkflowStep[] = [
      {
        id: 'step1',
        name: 'Step 1',
        type: 'CODE',
        valid: true,
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
      },
      {
        id: 'step2',
        name: 'Step 2',
        type: 'CODE',
        valid: true,
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
      },
      {
        id: 'step3',
        name: 'Step 3',
        type: 'CODE',
        valid: true,
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
      },
    ];
    const stepsOutput: WorkflowRunOutputStepsOutput = {
      step1: {
        id: 'step1',
        outputs: [
          {
            attemptCount: 1,
            result: undefined,
            error: '',
          },
        ],
      },
    };

    const result = generateWorkflowRunDiagram({ trigger, steps, stepsOutput });

    expect(result).toMatchInlineSnapshot(`
{
  "edges": [
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-3",
      "markerEnd": "workflow-edge-green-arrow-rounded",
      "markerStart": "workflow-edge-green-circle",
      "selectable": false,
      "source": "trigger",
      "target": "step1",
      "type": "success",
    },
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-4",
      "markerEnd": "workflow-edge-arrow-rounded",
      "markerStart": "workflow-edge-gray-circle",
      "selectable": false,
      "source": "step1",
      "target": "step2",
    },
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-5",
      "markerEnd": "workflow-edge-arrow-rounded",
      "markerStart": "workflow-edge-gray-circle",
      "selectable": false,
      "source": "step2",
      "target": "step3",
    },
  ],
  "nodes": [
    {
      "data": {
        "icon": "IconPlaylistAdd",
        "isLeafNode": false,
        "name": "Company created",
        "nodeType": "trigger",
        "runStatus": "success",
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
        "isLeafNode": false,
        "name": "Step 1",
        "nodeType": "action",
        "runStatus": "failure",
      },
      "id": "step1",
      "position": {
        "x": 0,
        "y": 0,
      },
    },
    {
      "data": {
        "actionType": "CODE",
        "isLeafNode": false,
        "name": "Step 2",
        "nodeType": "action",
        "runStatus": "not-executed",
      },
      "id": "step2",
      "position": {
        "x": 0,
        "y": 150,
      },
    },
    {
      "data": {
        "actionType": "CODE",
        "isLeafNode": false,
        "name": "Step 3",
        "nodeType": "action",
        "runStatus": "not-executed",
      },
      "id": "step3",
      "position": {
        "x": 0,
        "y": 300,
      },
    },
  ],
}
`);
  });

  it('marks all nodes as successful when each node has an output', () => {
    const trigger: WorkflowTrigger = {
      name: 'Company created',
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
    };
    const steps: WorkflowStep[] = [
      {
        id: 'step1',
        name: 'Step 1',
        type: 'CODE',
        valid: true,
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
      },
      {
        id: 'step2',
        name: 'Step 2',
        type: 'CODE',
        valid: true,
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
      },
      {
        id: 'step3',
        name: 'Step 3',
        type: 'CODE',
        valid: true,
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
      },
    ];
    const stepsOutput: WorkflowRunOutputStepsOutput = {
      step1: {
        id: 'step1',
        outputs: [
          {
            attemptCount: 1,
            result: {},
            error: undefined,
          },
        ],
      },
      step2: {
        id: 'step2',
        outputs: [
          {
            attemptCount: 1,
            result: {},
            error: undefined,
          },
        ],
      },
      step3: {
        id: 'step3',
        outputs: [
          {
            attemptCount: 1,
            result: {},
            error: undefined,
          },
        ],
      },
    };

    const result = generateWorkflowRunDiagram({ trigger, steps, stepsOutput });

    expect(result).toMatchInlineSnapshot(`
{
  "edges": [
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-6",
      "markerEnd": "workflow-edge-green-arrow-rounded",
      "markerStart": "workflow-edge-green-circle",
      "selectable": false,
      "source": "trigger",
      "target": "step1",
      "type": "success",
    },
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-7",
      "markerEnd": "workflow-edge-green-arrow-rounded",
      "markerStart": "workflow-edge-green-circle",
      "selectable": false,
      "source": "step1",
      "target": "step2",
      "type": "success",
    },
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-8",
      "markerEnd": "workflow-edge-green-arrow-rounded",
      "markerStart": "workflow-edge-green-circle",
      "selectable": false,
      "source": "step2",
      "target": "step3",
      "type": "success",
    },
  ],
  "nodes": [
    {
      "data": {
        "icon": "IconPlaylistAdd",
        "isLeafNode": false,
        "name": "Company created",
        "nodeType": "trigger",
        "runStatus": "success",
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
        "isLeafNode": false,
        "name": "Step 1",
        "nodeType": "action",
        "runStatus": "success",
      },
      "id": "step1",
      "position": {
        "x": 0,
        "y": 0,
      },
    },
    {
      "data": {
        "actionType": "CODE",
        "isLeafNode": false,
        "name": "Step 2",
        "nodeType": "action",
        "runStatus": "success",
      },
      "id": "step2",
      "position": {
        "x": 0,
        "y": 150,
      },
    },
    {
      "data": {
        "actionType": "CODE",
        "isLeafNode": false,
        "name": "Step 3",
        "nodeType": "action",
        "runStatus": "success",
      },
      "id": "step3",
      "position": {
        "x": 0,
        "y": 300,
      },
    },
  ],
}
`);
  });

  it('marks node as running and all other ones as not-executed when no output is available at all', () => {
    const trigger: WorkflowTrigger = {
      name: 'Company created',
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
    };
    const steps: WorkflowStep[] = [
      {
        id: 'step1',
        name: 'Step 1',
        type: 'CODE',
        valid: true,
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
      },
      {
        id: 'step2',
        name: 'Step 2',
        type: 'CODE',
        valid: true,
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
      },
      {
        id: 'step3',
        name: 'Step 3',
        type: 'CODE',
        valid: true,
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
      },
    ];
    const stepsOutput = undefined;

    const result = generateWorkflowRunDiagram({ trigger, steps, stepsOutput });

    expect(result).toMatchInlineSnapshot(`
{
  "edges": [
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-9",
      "markerEnd": "workflow-edge-green-arrow-rounded",
      "markerStart": "workflow-edge-green-circle",
      "selectable": false,
      "source": "trigger",
      "target": "step1",
      "type": "success",
    },
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-10",
      "markerEnd": "workflow-edge-arrow-rounded",
      "markerStart": "workflow-edge-gray-circle",
      "selectable": false,
      "source": "step1",
      "target": "step2",
    },
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-11",
      "markerEnd": "workflow-edge-arrow-rounded",
      "markerStart": "workflow-edge-gray-circle",
      "selectable": false,
      "source": "step2",
      "target": "step3",
    },
  ],
  "nodes": [
    {
      "data": {
        "icon": "IconPlaylistAdd",
        "isLeafNode": false,
        "name": "Company created",
        "nodeType": "trigger",
        "runStatus": "success",
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
        "isLeafNode": false,
        "name": "Step 1",
        "nodeType": "action",
        "runStatus": "running",
      },
      "id": "step1",
      "position": {
        "x": 0,
        "y": 0,
      },
    },
    {
      "data": {
        "actionType": "CODE",
        "isLeafNode": false,
        "name": "Step 2",
        "nodeType": "action",
        "runStatus": "not-executed",
      },
      "id": "step2",
      "position": {
        "x": 0,
        "y": 150,
      },
    },
    {
      "data": {
        "actionType": "CODE",
        "isLeafNode": false,
        "name": "Step 3",
        "nodeType": "action",
        "runStatus": "not-executed",
      },
      "id": "step3",
      "position": {
        "x": 0,
        "y": 300,
      },
    },
  ],
}
`);
  });

  it("marks node as running and all other ones as not-executed when a node doesn't have an attached output", () => {
    const trigger: WorkflowTrigger = {
      name: 'Company created',
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
    };
    const steps: WorkflowStep[] = [
      {
        id: 'step1',
        name: 'Step 1',
        type: 'CODE',
        valid: true,
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
      },
      {
        id: 'step2',
        name: 'Step 2',
        type: 'CODE',
        valid: true,
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
      },
      {
        id: 'step3',
        name: 'Step 3',
        type: 'CODE',
        valid: true,
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
      },
      {
        id: 'step4',
        name: 'Step 4',
        type: 'CODE',
        valid: true,
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
      },
    ];
    const stepsOutput: WorkflowRunOutputStepsOutput = {
      step1: {
        id: 'step1',
        outputs: [
          {
            attemptCount: 1,
            result: {},
            error: undefined,
          },
        ],
      },
    };

    const result = generateWorkflowRunDiagram({ trigger, steps, stepsOutput });

    expect(result).toMatchInlineSnapshot(`
{
  "edges": [
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-12",
      "markerEnd": "workflow-edge-green-arrow-rounded",
      "markerStart": "workflow-edge-green-circle",
      "selectable": false,
      "source": "trigger",
      "target": "step1",
      "type": "success",
    },
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-13",
      "markerEnd": "workflow-edge-green-arrow-rounded",
      "markerStart": "workflow-edge-green-circle",
      "selectable": false,
      "source": "step1",
      "target": "step2",
      "type": "success",
    },
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-14",
      "markerEnd": "workflow-edge-arrow-rounded",
      "markerStart": "workflow-edge-gray-circle",
      "selectable": false,
      "source": "step2",
      "target": "step3",
    },
    {
      "deletable": false,
      "id": "8f3b2121-f194-4ba4-9fbf-15",
      "markerEnd": "workflow-edge-arrow-rounded",
      "markerStart": "workflow-edge-gray-circle",
      "selectable": false,
      "source": "step3",
      "target": "step4",
    },
  ],
  "nodes": [
    {
      "data": {
        "icon": "IconPlaylistAdd",
        "isLeafNode": false,
        "name": "Company created",
        "nodeType": "trigger",
        "runStatus": "success",
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
        "isLeafNode": false,
        "name": "Step 1",
        "nodeType": "action",
        "runStatus": "success",
      },
      "id": "step1",
      "position": {
        "x": 0,
        "y": 0,
      },
    },
    {
      "data": {
        "actionType": "CODE",
        "isLeafNode": false,
        "name": "Step 2",
        "nodeType": "action",
        "runStatus": "running",
      },
      "id": "step2",
      "position": {
        "x": 0,
        "y": 150,
      },
    },
    {
      "data": {
        "actionType": "CODE",
        "isLeafNode": false,
        "name": "Step 3",
        "nodeType": "action",
        "runStatus": "not-executed",
      },
      "id": "step3",
      "position": {
        "x": 0,
        "y": 300,
      },
    },
    {
      "data": {
        "actionType": "CODE",
        "isLeafNode": false,
        "name": "Step 4",
        "nodeType": "action",
        "runStatus": "not-executed",
      },
      "id": "step4",
      "position": {
        "x": 0,
        "y": 450,
      },
    },
  ],
}
`);
  });
});
