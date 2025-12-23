import { type WorkflowRunFlow } from '@/workflow/types/Workflow';
import { StepStatus, TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { getWorkflowRunStepContext } from '@/workflow/workflow-steps/utils/getWorkflowRunStepContext';

const mockFlow = {
  trigger: {
    type: 'MANUAL',
    name: 'Trigger',
    settings: { outputSchema: {} },
  },
  steps: [
    {
      id: 'step1',
      name: 'Step 1',
      type: 'CODE',
      nextStepIds: ['step2'],
      valid: true,
      settings: {
        input: {
          serverlessFunctionId: '',
          serverlessFunctionInput: {},
          serverlessFunctionVersion: '',
        },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: false },
          continueOnFailure: { value: false },
        },
      },
    },
    {
      id: 'step2',
      name: 'Step 2',
      type: 'CODE',
      nextStepIds: [],
      valid: true,
      settings: {
        input: {
          serverlessFunctionId: '',
          serverlessFunctionInput: {},
          serverlessFunctionVersion: '',
        },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: false },
          continueOnFailure: { value: false },
        },
      },
    },
  ],
} satisfies WorkflowRunFlow;

const mockStepInfos = {
  [TRIGGER_STEP_ID]: { result: 'trigger-result', status: StepStatus.SUCCESS },
  step1: { result: 'step1-result', status: StepStatus.SUCCESS },
  step2: { result: 'step2-result', status: StepStatus.SUCCESS },
};

const mockStepInfosWithHistory = {
  [TRIGGER_STEP_ID]: { result: 'trigger-result', status: StepStatus.SUCCESS },
  step1: {
    result: 'step1-result',
    status: StepStatus.SUCCESS,
    history: [
      { result: 'step1-result', status: StepStatus.SUCCESS },
      { result: 'step1-result-2', status: StepStatus.SUCCESS },
    ],
  },
  step2: {
    result: 'step2-result',
    status: StepStatus.SUCCESS,
    history: [
      { result: 'step2-result', status: StepStatus.SUCCESS },
      { result: 'step2-result-2', status: StepStatus.SUCCESS },
    ],
  },
};

describe('getWorkflowRunStepContext', () => {
  it('returns empty array for trigger step', () => {
    const result = getWorkflowRunStepContext({
      stepId: TRIGGER_STEP_ID,
      flow: mockFlow,
      stepInfos: mockStepInfos,
      currentLoopIterationIndex: undefined,
    });
    expect(result).toEqual([]);
  });

  it('returns context for previous steps and trigger', () => {
    const result = getWorkflowRunStepContext({
      stepId: 'step2',
      flow: mockFlow,
      stepInfos: mockStepInfos,
      currentLoopIterationIndex: undefined,
    });
    expect(result).toEqual([
      { id: TRIGGER_STEP_ID, name: 'Trigger', context: 'trigger-result' },
      { id: 'step1', name: 'Step 1', context: 'step1-result' },
    ]);
  });

  it('returns context for previous steps with loop index', () => {
    const result = getWorkflowRunStepContext({
      stepId: 'step2',
      flow: mockFlow,
      stepInfos: mockStepInfosWithHistory,
      currentLoopIterationIndex: 1,
    });
    expect(result).toEqual([
      { id: TRIGGER_STEP_ID, name: 'Trigger', context: 'trigger-result' },
      { id: 'step1', name: 'Step 1', context: 'step1-result-2' },
    ]);
  });

  it('returns empty array if step not found', () => {
    const result = getWorkflowRunStepContext({
      stepId: 'unknown',
      flow: mockFlow,
      stepInfos: mockStepInfos,
      currentLoopIterationIndex: undefined,
    });
    expect(result).toEqual([]);
  });

  it('handles iterator step type and loop context', () => {
    const flowWithIterator = {
      trigger: {
        type: 'MANUAL',
        name: 'Trigger',
        settings: { outputSchema: {} },
      },
      steps: [
        {
          id: 'step1',
          name: 'Step 1',
          type: 'CODE',
          nextStepIds: ['iterator1'],
          valid: true,
          settings: {
            input: {
              serverlessFunctionId: '',
              serverlessFunctionInput: {},
              serverlessFunctionVersion: '',
            },
            outputSchema: {},
            errorHandlingOptions: {
              retryOnFailure: { value: false },
              continueOnFailure: { value: false },
            },
          },
        },
        {
          id: 'iterator1',
          name: 'Iterator',
          type: 'ITERATOR',
          nextStepIds: [],
          valid: true,
          settings: {
            input: {
              initialLoopStepIds: ['step2'],
              items: [1, 2, 3],
            },
            outputSchema: {},
            errorHandlingOptions: {
              retryOnFailure: { value: false },
              continueOnFailure: { value: false },
            },
          },
        },
        {
          id: 'step2',
          name: 'Step 2',
          type: 'CODE',
          nextStepIds: ['iterator1'],
          valid: true,
          settings: {
            input: {
              serverlessFunctionId: '',
              serverlessFunctionInput: {},
              serverlessFunctionVersion: '',
            },
            outputSchema: {},
            errorHandlingOptions: {
              retryOnFailure: { value: false },
              continueOnFailure: { value: false },
            },
          },
        },
      ],
    } satisfies WorkflowRunFlow;

    const stepInfos = {
      [TRIGGER_STEP_ID]: {
        result: 'trigger-result',
        status: StepStatus.SUCCESS,
      },
      step1: {
        result: 'step1-result',
        status: StepStatus.SUCCESS,
      },
      iterator1: {
        result: {
          currentItemIndex: 2,
          hasProcessedAllItems: true,
        },
        status: StepStatus.SUCCESS,
        history: [
          {
            result: {
              currentItem: 1,
              currentItemIndex: 0,
              hasProcessedAllItems: false,
            },
            status: StepStatus.RUNNING,
          },
          {
            result: {
              currentItem: 2,
              currentItemIndex: 1,
              hasProcessedAllItems: false,
            },
            status: StepStatus.RUNNING,
          },
        ],
      },
      step2: {
        result: 'step2-result-3',
        status: StepStatus.SUCCESS,
        history: [
          { result: 'step2-result-1', status: StepStatus.SUCCESS },
          { result: 'step2-result-2', status: StepStatus.SUCCESS },
        ],
      },
    };

    const step2Iteration0Result = getWorkflowRunStepContext({
      stepId: 'step2',
      flow: flowWithIterator,
      stepInfos,
      currentLoopIterationIndex: 0,
    });

    expect(step2Iteration0Result).toMatchInlineSnapshot(`
[
  {
    "context": "trigger-result",
    "id": "trigger",
    "name": "Trigger",
  },
  {
    "context": "step1-result",
    "id": "step1",
    "name": "Step 1",
  },
  {
    "context": {
      "currentItem": 1,
      "currentItemIndex": 0,
      "hasProcessedAllItems": false,
    },
    "id": "iterator1",
    "name": "Iterator",
  },
]
`);

    const step2Iteration1Result = getWorkflowRunStepContext({
      stepId: 'step2',
      flow: flowWithIterator,
      stepInfos,
      currentLoopIterationIndex: 1,
    });

    expect(step2Iteration1Result).toMatchInlineSnapshot(`
[
  {
    "context": "trigger-result",
    "id": "trigger",
    "name": "Trigger",
  },
  {
    "context": "step1-result",
    "id": "step1",
    "name": "Step 1",
  },
  {
    "context": {
      "currentItem": 2,
      "currentItemIndex": 1,
      "hasProcessedAllItems": false,
    },
    "id": "iterator1",
    "name": "Iterator",
  },
]
`);
  });
});
