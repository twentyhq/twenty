import { WorkflowRunFlow } from '@/workflow/types/Workflow';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { getWorkflowRunStepContext } from '../getWorkflowRunStepContext';
import { StepStatus } from 'twenty-shared/workflow';

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
    const stepInfos = {
      [TRIGGER_STEP_ID]: {
        result: { company: { id: '123' } },
        status: StepStatus.SUCCESS,
      },
    };

    const result = getWorkflowRunStepContext({
      stepId: TRIGGER_STEP_ID,
      flow,
      stepInfos,
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
          nextStepIds: ['step2'],
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
          nextStepIds: [],
        },
      ],
    } satisfies WorkflowRunFlow;

    const stepInfos = {
      [TRIGGER_STEP_ID]: {
        result: { company: { id: '123' } },
        status: StepStatus.SUCCESS,
      },
      step1: { result: { taskId: '456' }, status: StepStatus.SUCCESS },
      step2: { result: { taskId: '456' }, status: StepStatus.SUCCESS },
    };

    const result = getWorkflowRunStepContext({
      stepId: 'step2',
      flow,
      stepInfos,
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
    const stepInfos = {
      [TRIGGER_STEP_ID]: {
        result: { company: { id: '123' } },
        status: StepStatus.SUCCESS,
      },
      step1: { result: { taskId: '456' }, status: StepStatus.SUCCESS },
      step2: { result: { emailId: '789' }, status: StepStatus.SUCCESS },
    };

    const result = getWorkflowRunStepContext({
      stepId: 'step1',
      flow,
      stepInfos,
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
          nextStepIds: ['step2'],
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
          nextStepIds: ['step3'],
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
          nextStepIds: [],
        },
      ],
    } satisfies WorkflowRunFlow;
    const stepInfos = {
      [TRIGGER_STEP_ID]: {
        result: { company: { id: '123' } },
        status: StepStatus.SUCCESS,
      },
      step1: { result: { noteId: '456' }, status: StepStatus.SUCCESS },
      step2: { result: { noteId: '789' }, status: StepStatus.SUCCESS },
      step3: { result: { noteId: '101' }, status: StepStatus.SUCCESS },
    };

    const result = getWorkflowRunStepContext({
      stepId: 'step3',
      flow,
      stepInfos,
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
