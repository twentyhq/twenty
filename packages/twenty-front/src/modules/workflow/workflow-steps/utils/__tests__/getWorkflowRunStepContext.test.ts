import { WorkflowRunFlow } from '@/workflow/types/Workflow';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { getWorkflowRunStepContext } from '../getWorkflowRunStepContext';

describe('getWorkflowRunStepContext', () => {
  it('should return only trigger context for trigger step', () => {
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

    expect(result).toEqual({
      'Company Created': { company: { id: '123' } },
    });
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

    expect(result).toEqual({
      'Company Created': { company: { id: '123' } },
      'Create company': { taskId: '456' },
    });
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

    expect(result).toEqual({
      'Company Created': { company: { id: '123' } },
    });
  });
});
