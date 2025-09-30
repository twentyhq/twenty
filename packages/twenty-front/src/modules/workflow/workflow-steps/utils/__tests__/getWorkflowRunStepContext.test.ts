import { type WorkflowRunFlow } from '@/workflow/types/Workflow';
import { StepStatus, TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { getWorkflowRunStepContext } from '../getWorkflowRunStepContext';

describe('getWorkflowRunStepContext', () => {
  it('should return an empty array for trigger step', () => {
    const flow = {
      trigger: {
        type: 'DATABASE_EVENT',
        name: 'Company Created',
        settings: {
          eventName: 'company.created',
          outputSchema: {},
        },
      },
      steps: [],
  };
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
      currentLoopIterationIndex: undefined,
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
          id: 'iterator1',
          name: 'Loop Companies',
          type: 'ITERATOR',
          settings: {
            outputSchema: {},
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: false },
            },
            input: {
              items: ['A', 'B', 'C'],
              initialLoopStepIds: ['stepA'],
            },
          },
          valid: true,
          nextStepIds: ['stepA'],
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
  };

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
      currentLoopIterationIndex: undefined,
    });

    expect(result).toEqual([
      {
        id: TRIGGER_STEP_ID,
        name: 'Company Created',
        context: { company: { id: '123' } },
      },
        {
          id: 'iterator1',
          name: 'Loop Companies',
          type: 'ITERATOR',
          settings: {
            outputSchema: {},
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: false },
            },
            input: {
              items: ['A', 'B', 'C'],
              initialLoopStepIds: ['stepA'],
            },
          },
          valid: true,
          nextStepIds: ['stepA'],
        },
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
      currentLoopIterationIndex: undefined,
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
      currentLoopIterationIndex: undefined,
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
  it('should select correct iteration context for steps inside a loop', () => {
    const flow = {
      trigger: {
        type: 'DATABASE_EVENT',
        name: 'Trigger',
        settings: {
          eventName: 'event',
          outputSchema: {},
        },
      },
      steps: [
        {
          id: 'iterator1',
          name: 'Loop Companies',
          type: 'ITERATOR',
          settings: {
            outputSchema: {},
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: false },
            },
            input: {
              items: ['A', 'B', 'C'],
              initialLoopStepIds: ['stepA'],
            },
          },
          valid: true,
          nextStepIds: ['stepA'],
        },
        {
          id: 'stepA',
          name: 'Process Company',
          type: 'CODE',
          settings: {
            outputSchema: {},
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: false },
            },
            input: {
              serverlessFunctionId: 'func-id',
              serverlessFunctionVersion: 'v1',
              serverlessFunctionInput: {},
            },
          },
          valid: true,
          nextStepIds: [],
        },
      ],
    } satisfies WorkflowRunFlow;

    // Simulate stepInfos with multiple histories for stepA (looped)
    const stepInfos = {
      [TRIGGER_STEP_ID]: {
        result: { trigger: true },
        status: StepStatus.SUCCESS,
      },
      iterator1: {
        result: { companies: ['A', 'B', 'C'] },
        status: StepStatus.SUCCESS,
      },
      stepA: {
        history: [
          {
            result: { company: 'A', processed: true },
            status: StepStatus.SUCCESS,
          },
          {
            result: { company: 'B', processed: false },
            status: StepStatus.SUCCESS,
          },
          {
            result: { company: 'C', processed: true },
            status: StepStatus.SUCCESS,
          },
        ],
        status: StepStatus.SUCCESS,
      },
    };

    // Test for iteration 1 (company B)
    const result = getWorkflowRunStepContext({
      stepId: 'stepA',
      flow,
      stepInfos,
      currentLoopIterationIndex: 1,
    });

    expect(result).toEqual([
      {
        id: TRIGGER_STEP_ID,
        name: 'Trigger',
        context: { trigger: true },
      },
      {
        id: 'iterator1',
        name: 'Loop Companies',
        context: { companies: ['A', 'B', 'C'] },
      },
    ]);
  });

  it('should select first iteration context when not in a loop', () => {
    const flow = {
      trigger: {
        type: 'DATABASE_EVENT',
        name: 'Trigger',
        settings: {
          eventName: 'event',
          outputSchema: {},
        },
      },
      steps: [
        {
          id: 'iterator1',
          name: 'Loop Companies',
          type: 'ITERATOR',
          settings: {
            outputSchema: {},
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: false },
            },
            input: {},
          },
          valid: true,
          nextStepIds: ['stepA'],
        },
        {
          id: 'stepA',
          name: 'Process Company',
          type: 'CODE',
          settings: {
            outputSchema: {},
            errorHandlingOptions: {
              continueOnFailure: { value: false },
              retryOnFailure: { value: false },
            },
            input: {
              serverlessFunctionId: 'func-id',
              serverlessFunctionVersion: 'v1',
              serverlessFunctionInput: {},
            },
          },
          valid: true,
          nextStepIds: [],
        },
      ],
    } satisfies WorkflowRunFlow;

    const stepInfos = {
      [TRIGGER_STEP_ID]: {
        result: { trigger: true },
        status: StepStatus.SUCCESS,
      },
      iterator1: {
        result: { companies: ['A', 'B', 'C'] },
        status: StepStatus.SUCCESS,
      },
      stepA: {
        history: [
          {
            result: { company: 'A', processed: true },
            status: StepStatus.SUCCESS,
          },
          {
            result: { company: 'B', processed: false },
            status: StepStatus.SUCCESS,
          },
          {
            result: { company: 'C', processed: true },
            status: StepStatus.SUCCESS,
          },
        ],
        status: StepStatus.SUCCESS,
      },
    };

    // No loop index, should pick first history item
    const result = getWorkflowRunStepContext({
      stepId: 'stepA',
      flow,
      stepInfos,
      currentLoopIterationIndex: undefined,
    });

    expect(result).toEqual([
      {
        id: TRIGGER_STEP_ID,
        name: 'Trigger',
        context: { trigger: true },
      },
      {
        id: 'iterator1',
        name: 'Loop Companies',
        context: { companies: ['A', 'B', 'C'] },
      },
    ]);
  });
});
