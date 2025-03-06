import { WorkflowRunFlow } from '@/workflow/types/Workflow';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { getWorkflowRunStepContext } from '../getWorkflowRunStepContext';

describe('getWorkflowRunStepContext', () => {
  it('should return an empty array for trigger step', () => {
    const flow = {
      trigger: {
        name: 'Company Created',
        type: 'DATABASE_EVENT',
        settings: {
          eventName: 'company.created',
          outputSchema: {},
        },
      },
      steps: [],
    } satisfies WorkflowRunFlow;
    const context = {
      [TRIGGER_STEP_ID]: { company: { id: '123' } },
    };

    const result = getWorkflowRunStepContext({
      stepId: TRIGGER_STEP_ID,
      flow,
      context,
    });

    expect(result).toEqual([]);
  });

  it('should include previous steps context', () => {
    const flow = {
      trigger: {
        name: 'Company Created',
        type: 'DATABASE_EVENT',
        settings: {
          eventName: 'company.created',
          outputSchema: {},
        },
      },
      steps: [
        {
          id: 'step1',
          name: 'Create company',
          type: 'CREATE_RECORD',
          settings: {
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: false },
            },
            input: {
              objectName: 'Company',
              objectRecord: {},
            },
            outputSchema: {},
          },
          valid: true,
        },
        {
          id: 'step2',
          name: 'Send Email',
          type: 'SEND_EMAIL',
          settings: {
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: false },
            },
            input: {
              connectedAccountId: '123',
              email: '',
            },
            outputSchema: {},
          },
          valid: true,
        },
      ],
    } satisfies WorkflowRunFlow;
    const context = {
      [TRIGGER_STEP_ID]: { company: { id: '123' } },
      step1: { taskId: '456' },
    };

    const result = getWorkflowRunStepContext({
      stepId: 'step2',
      flow,
      context,
    });

    expect(result).toEqual([
      {
        id: TRIGGER_STEP_ID,
        name: 'Company Created',
        context: { company: { id: '123' } },
      },
      {
        id: 'step1',
        name: 'Create company',
        context: { taskId: '456' },
      },
    ]);
  });

  it('should not include subsequent steps context', () => {
    const flow = {
      trigger: {
        name: 'Company Created',
        type: 'DATABASE_EVENT',
        settings: {
          eventName: 'company.created',
          outputSchema: {},
        },
      },
      steps: [
        {
          id: 'step1',
          name: 'Create company',
          type: 'CREATE_RECORD',
          settings: {
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: false },
            },
            input: {
              objectName: 'Company',
              objectRecord: {},
            },
            outputSchema: {},
          },
          valid: true,
        },
        {
          id: 'step2',
          name: 'Send Email',
          type: 'SEND_EMAIL',
          settings: {
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: false },
            },
            input: {
              connectedAccountId: '123',
              email: '',
            },
            outputSchema: {},
          },
          valid: true,
        },
      ],
    } satisfies WorkflowRunFlow;
    const context = {
      [TRIGGER_STEP_ID]: { company: { id: '123' } },
      step1: { taskId: '456' },
      step2: { emailId: '789' },
    };

    const result = getWorkflowRunStepContext({
      stepId: 'step1',
      flow,
      context,
    });

    expect(result).toEqual([
      {
        id: TRIGGER_STEP_ID,
        name: 'Company Created',
        context: { company: { id: '123' } },
      },
    ]);
  });

  it('should handle multiple steps with the same name', () => {
    const flow = {
      trigger: {
        name: 'Company Created',
        type: 'DATABASE_EVENT',
        settings: {
          eventName: 'company.created',
          outputSchema: {},
        },
      },
      steps: [
        {
          id: 'step1',
          name: 'Create Note',
          type: 'CREATE_RECORD',
          settings: {
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: false },
            },
            input: {
              objectName: 'Note',
              objectRecord: {},
            },
            outputSchema: {},
          },
          valid: true,
        },
        {
          id: 'step2',
          name: 'Create Note',
          type: 'CREATE_RECORD',
          settings: {
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: false },
            },
            input: {
              objectName: 'Note',
              objectRecord: {},
            },
            outputSchema: {},
          },
          valid: true,
        },
        {
          id: 'step3',
          name: 'Create Note',
          type: 'CREATE_RECORD',
          settings: {
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: false },
            },
            input: {
              objectName: 'Note',
              objectRecord: {},
            },
            outputSchema: {},
          },
          valid: true,
        },
      ],
    } satisfies WorkflowRunFlow;
    const context = {
      [TRIGGER_STEP_ID]: { company: { id: '123' } },
      step1: { noteId: '456' },
      step2: { noteId: '789' },
      step3: { noteId: '101' },
    };

    const result = getWorkflowRunStepContext({
      stepId: 'step3',
      flow,
      context,
    });

    expect(result).toEqual([
      {
        id: TRIGGER_STEP_ID,
        name: 'Company Created',
        context: { company: { id: '123' } },
      },
      {
        id: 'step1',
        name: 'Create Note',
        context: { noteId: '456' },
      },
      {
        id: 'step2',
        name: 'Create Note',
        context: { noteId: '789' },
      },
    ]);
  });
});
