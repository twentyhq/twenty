import {
  type WorkflowStep,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { FieldMetadataType } from 'twenty-shared/types';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';
import { getUuidV4Mock } from '~/testing/utils/getUuidV4Mock';
import { generateWorkflowRunDiagram } from '@/workflow/workflow-diagram/utils/generateWorkflowRunDiagram';

jest.mock('uuid', () => ({
  v4: getUuidV4Mock(),
}));

describe('generateWorkflowRunDiagram', () => {
  it('marks node as failed when the last attempt failed', () => {
    const trigger: WorkflowTrigger = {
      name: 'Company created',
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
      nextStepIds: ['step1'],
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
        nextStepIds: ['step2'],
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
        nextStepIds: ['step3'],
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
        nextStepIds: undefined,
      },
    ];

    const stepInfos: WorkflowRunStepInfos = {
      trigger: {
        result: {},
        status: StepStatus.SUCCESS,
      },
      step1: {
        error: '',
        status: StepStatus.FAILED,
      },
      step2: {
        status: StepStatus.NOT_STARTED,
      },
      step3: {
        status: StepStatus.NOT_STARTED,
      },
    };

    const result = generateWorkflowRunDiagram({
      trigger,
      steps,
      stepInfos,
    });

    expect(result).toMatchInlineSnapshot(`
{
  "diagram": {
    "edges": [
      {
        "data": {
          "edgeExecutionStatus": "SUCCESS",
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-0",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "trigger",
        "sourceHandle": "default",
        "target": "step1",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
      {
        "data": {
          "edgeExecutionStatus": "FAILED",
          "edgePathStrategy": undefined,
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-1",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "step1",
        "sourceHandle": "default",
        "target": "step2",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
      {
        "data": {
          "edgeExecutionStatus": "NOT_STARTED",
          "edgePathStrategy": undefined,
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-2",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "step2",
        "sourceHandle": "default",
        "target": "step3",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
    ],
    "nodes": [
      {
        "data": {
          "hasNextStepIds": true,
          "icon": "IconPlaylistAdd",
          "name": "Company created",
          "nodeType": "trigger",
          "position": {
            "x": 0,
            "y": 0,
          },
          "runStatus": "SUCCESS",
          "stepId": "trigger",
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
          "hasNextStepIds": true,
          "name": "Step 1",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 150,
          },
          "runStatus": "FAILED",
          "stepId": "step1",
        },
        "id": "step1",
        "position": {
          "x": 0,
          "y": 150,
        },
      },
      {
        "data": {
          "actionType": "CODE",
          "hasNextStepIds": true,
          "name": "Step 2",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 300,
          },
          "runStatus": "NOT_STARTED",
          "stepId": "step2",
        },
        "id": "step2",
        "position": {
          "x": 0,
          "y": 300,
        },
      },
      {
        "data": {
          "actionType": "CODE",
          "hasNextStepIds": false,
          "name": "Step 3",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 450,
          },
          "runStatus": "NOT_STARTED",
          "stepId": "step3",
        },
        "id": "step3",
        "position": {
          "x": 0,
          "y": 450,
        },
      },
    ],
  },
  "stepToOpenByDefault": undefined,
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
      nextStepIds: ['step1'],
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
        nextStepIds: ['step2'],
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
        nextStepIds: ['step3'],
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
        nextStepIds: undefined,
      },
    ];

    const stepInfos: WorkflowRunStepInfos = {
      trigger: {
        result: {},
        status: StepStatus.SUCCESS,
      },
      step1: {
        result: {},
        status: StepStatus.SUCCESS,
      },
      step2: {
        result: {},
        status: StepStatus.SUCCESS,
      },
      step3: {
        result: {},
        status: StepStatus.SUCCESS,
      },
    };

    const result = generateWorkflowRunDiagram({
      trigger,
      steps,
      stepInfos,
    });

    expect(result).toMatchInlineSnapshot(`
{
  "diagram": {
    "edges": [
      {
        "data": {
          "edgeExecutionStatus": "SUCCESS",
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-3",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "trigger",
        "sourceHandle": "default",
        "target": "step1",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
      {
        "data": {
          "edgeExecutionStatus": "SUCCESS",
          "edgePathStrategy": undefined,
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-4",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "step1",
        "sourceHandle": "default",
        "target": "step2",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
      {
        "data": {
          "edgeExecutionStatus": "SUCCESS",
          "edgePathStrategy": undefined,
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-5",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "step2",
        "sourceHandle": "default",
        "target": "step3",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
    ],
    "nodes": [
      {
        "data": {
          "hasNextStepIds": true,
          "icon": "IconPlaylistAdd",
          "name": "Company created",
          "nodeType": "trigger",
          "position": {
            "x": 0,
            "y": 0,
          },
          "runStatus": "SUCCESS",
          "stepId": "trigger",
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
          "hasNextStepIds": true,
          "name": "Step 1",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 150,
          },
          "runStatus": "SUCCESS",
          "stepId": "step1",
        },
        "id": "step1",
        "position": {
          "x": 0,
          "y": 150,
        },
      },
      {
        "data": {
          "actionType": "CODE",
          "hasNextStepIds": true,
          "name": "Step 2",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 300,
          },
          "runStatus": "SUCCESS",
          "stepId": "step2",
        },
        "id": "step2",
        "position": {
          "x": 0,
          "y": 300,
        },
      },
      {
        "data": {
          "actionType": "CODE",
          "hasNextStepIds": false,
          "name": "Step 3",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 450,
          },
          "runStatus": "SUCCESS",
          "stepId": "step3",
        },
        "id": "step3",
        "position": {
          "x": 0,
          "y": 450,
        },
      },
    ],
  },
  "stepToOpenByDefault": undefined,
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
      nextStepIds: ['step1'],
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
        nextStepIds: ['step2'],
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
        nextStepIds: ['step3'],
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
        nextStepIds: undefined,
      },
    ];

    const stepInfos: WorkflowRunStepInfos = {
      trigger: {
        result: {},
        status: StepStatus.SUCCESS,
      },
      step1: {
        error: '',
        status: StepStatus.RUNNING,
      },
      step2: {
        error: '',
        status: StepStatus.NOT_STARTED,
      },
      step3: {
        error: '',
        status: StepStatus.NOT_STARTED,
      },
    };

    const result = generateWorkflowRunDiagram({
      trigger,
      steps,
      stepInfos,
    });

    expect(result).toMatchInlineSnapshot(`
{
  "diagram": {
    "edges": [
      {
        "data": {
          "edgeExecutionStatus": "SUCCESS",
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-6",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "trigger",
        "sourceHandle": "default",
        "target": "step1",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
      {
        "data": {
          "edgeExecutionStatus": "RUNNING",
          "edgePathStrategy": undefined,
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-7",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "step1",
        "sourceHandle": "default",
        "target": "step2",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
      {
        "data": {
          "edgeExecutionStatus": "NOT_STARTED",
          "edgePathStrategy": undefined,
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-8",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "step2",
        "sourceHandle": "default",
        "target": "step3",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
    ],
    "nodes": [
      {
        "data": {
          "hasNextStepIds": true,
          "icon": "IconPlaylistAdd",
          "name": "Company created",
          "nodeType": "trigger",
          "position": {
            "x": 0,
            "y": 0,
          },
          "runStatus": "SUCCESS",
          "stepId": "trigger",
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
          "hasNextStepIds": true,
          "name": "Step 1",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 150,
          },
          "runStatus": "RUNNING",
          "stepId": "step1",
        },
        "id": "step1",
        "position": {
          "x": 0,
          "y": 150,
        },
      },
      {
        "data": {
          "actionType": "CODE",
          "hasNextStepIds": true,
          "name": "Step 2",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 300,
          },
          "runStatus": "NOT_STARTED",
          "stepId": "step2",
        },
        "id": "step2",
        "position": {
          "x": 0,
          "y": 300,
        },
      },
      {
        "data": {
          "actionType": "CODE",
          "hasNextStepIds": false,
          "name": "Step 3",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 450,
          },
          "runStatus": "NOT_STARTED",
          "stepId": "step3",
        },
        "id": "step3",
        "position": {
          "x": 0,
          "y": 450,
        },
      },
    ],
  },
  "stepToOpenByDefault": undefined,
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
      nextStepIds: ['step1'],
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
        nextStepIds: ['step2'],
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
        nextStepIds: ['step3'],
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
        nextStepIds: ['step4'],
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
        nextStepIds: undefined,
      },
    ];

    const stepInfos: WorkflowRunStepInfos = {
      trigger: {
        result: {},
        status: StepStatus.SUCCESS,
      },
      step1: {
        result: {},
        status: StepStatus.SUCCESS,
      },
      step2: {
        result: {},
        status: StepStatus.RUNNING,
      },
      step3: {
        result: {},
        status: StepStatus.NOT_STARTED,
      },
    };

    const result = generateWorkflowRunDiagram({
      trigger,
      steps,
      stepInfos,
    });

    expect(result).toMatchInlineSnapshot(`
{
  "diagram": {
    "edges": [
      {
        "data": {
          "edgeExecutionStatus": "SUCCESS",
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-9",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "trigger",
        "sourceHandle": "default",
        "target": "step1",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
      {
        "data": {
          "edgeExecutionStatus": "SUCCESS",
          "edgePathStrategy": undefined,
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-10",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "step1",
        "sourceHandle": "default",
        "target": "step2",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
      {
        "data": {
          "edgeExecutionStatus": "RUNNING",
          "edgePathStrategy": undefined,
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-11",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "step2",
        "sourceHandle": "default",
        "target": "step3",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
      {
        "data": {
          "edgeExecutionStatus": "NOT_STARTED",
          "edgePathStrategy": undefined,
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-12",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "step3",
        "sourceHandle": "default",
        "target": "step4",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
    ],
    "nodes": [
      {
        "data": {
          "hasNextStepIds": true,
          "icon": "IconPlaylistAdd",
          "name": "Company created",
          "nodeType": "trigger",
          "position": {
            "x": 0,
            "y": 0,
          },
          "runStatus": "SUCCESS",
          "stepId": "trigger",
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
          "hasNextStepIds": true,
          "name": "Step 1",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 150,
          },
          "runStatus": "SUCCESS",
          "stepId": "step1",
        },
        "id": "step1",
        "position": {
          "x": 0,
          "y": 150,
        },
      },
      {
        "data": {
          "actionType": "CODE",
          "hasNextStepIds": true,
          "name": "Step 2",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 300,
          },
          "runStatus": "RUNNING",
          "stepId": "step2",
        },
        "id": "step2",
        "position": {
          "x": 0,
          "y": 300,
        },
      },
      {
        "data": {
          "actionType": "CODE",
          "hasNextStepIds": true,
          "name": "Step 3",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 450,
          },
          "runStatus": "NOT_STARTED",
          "stepId": "step3",
        },
        "id": "step3",
        "position": {
          "x": 0,
          "y": 450,
        },
      },
      {
        "data": {
          "actionType": "CODE",
          "hasNextStepIds": false,
          "name": "Step 4",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 600,
          },
          "runStatus": "NOT_STARTED",
          "stepId": "step4",
        },
        "id": "step4",
        "position": {
          "x": 0,
          "y": 600,
        },
      },
    ],
  },
  "stepToOpenByDefault": undefined,
}
`);
  });

  it('marks node as running when a Form step is pending and return its data as the stepToOpenByDefault object', () => {
    const trigger: WorkflowTrigger = {
      name: 'Company created',
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.created',
        outputSchema: {},
      },
      nextStepIds: ['step1'],
    };
    const steps: WorkflowStep[] = [
      {
        id: 'step1',
        name: 'Step 1',
        type: 'FORM',
        valid: true,
        settings: {
          errorHandlingOptions: {
            retryOnFailure: { value: true },
            continueOnFailure: { value: false },
          },
          input: [
            {
              id: 'field-1',
              name: 'text',
              label: 'Text Field',
              type: FieldMetadataType.TEXT,
              placeholder: 'Enter text',
              settings: {},
            },
          ],
          outputSchema: {},
        },
        nextStepIds: undefined,
      },
    ];

    const stepInfos: WorkflowRunStepInfos = {
      trigger: {
        result: {},
        status: StepStatus.SUCCESS,
      },
      step1: {
        result: {},
        status: StepStatus.PENDING,
      },
      step2: {
        result: {},
        status: StepStatus.NOT_STARTED,
      },
      step3: {
        result: {},
        status: StepStatus.NOT_STARTED,
      },
    };

    const result = generateWorkflowRunDiagram({
      trigger,
      steps,
      stepInfos,
    });

    expect(result).toMatchInlineSnapshot(`
{
  "diagram": {
    "edges": [
      {
        "data": {
          "edgeExecutionStatus": "SUCCESS",
          "edgeType": "default",
        },
        "deletable": false,
        "id": "8f3b2121-f194-4ba4-9fbf-13",
        "markerEnd": "edge-branch-arrow-default",
        "markerStart": undefined,
        "selectable": false,
        "source": "trigger",
        "sourceHandle": "default",
        "target": "step1",
        "targetHandle": "default",
        "type": "readonly",
        "zIndex": -2,
      },
    ],
    "nodes": [
      {
        "data": {
          "hasNextStepIds": true,
          "icon": "IconPlaylistAdd",
          "name": "Company created",
          "nodeType": "trigger",
          "position": {
            "x": 0,
            "y": 0,
          },
          "runStatus": "SUCCESS",
          "stepId": "trigger",
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
          "actionType": "FORM",
          "hasNextStepIds": false,
          "name": "Step 1",
          "nodeType": "action",
          "position": {
            "x": 0,
            "y": 150,
          },
          "runStatus": "PENDING",
          "stepId": "step1",
        },
        "id": "step1",
        "position": {
          "x": 0,
          "y": 150,
        },
      },
    ],
  },
  "stepToOpenByDefault": {
    "data": {
      "actionType": "FORM",
      "hasNextStepIds": false,
      "name": "Step 1",
      "nodeType": "action",
      "position": {
        "x": 0,
        "y": 150,
      },
      "runStatus": "PENDING",
      "stepId": "step1",
    },
    "id": "step1",
  },
}
`);
  });
});
