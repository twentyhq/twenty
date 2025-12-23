import { type WorkflowStep } from '@/workflow/types/Workflow';
import { type WorkflowRunStepInfo, StepStatus } from 'twenty-shared/workflow';
import { getStepInfoHistoryItem } from '@/workflow/workflow-steps/utils/getStepInfoHistoryItem';

describe('getStepInfoHistoryItem', () => {
  const iteratorStep: WorkflowStep = {
    id: 'iterator1',
    name: 'Iterator',
    type: 'ITERATOR',
    valid: true,
    nextStepIds: ['step2'],
    settings: {
      input: { initialLoopStepIds: ['step2'] },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
    },
  };

  const codeStep: WorkflowStep = {
    id: 'step2',
    name: 'Step 2',
    type: 'CODE',
    valid: true,
    nextStepIds: [],
    settings: {
      input: {
        serverlessFunctionId: 'func',
        serverlessFunctionVersion: '1.0.0',
        serverlessFunctionInput: {},
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
    },
  };

  const steps: WorkflowStep[] = [iteratorStep, codeStep];

  it('returns the correct history item for a descendant of iterator', () => {
    const stepInfo: WorkflowRunStepInfo = {
      result: 'final',
      status: StepStatus.SUCCESS,
      history: [
        { result: 'first', status: StepStatus.SUCCESS },
        { result: 'second', status: StepStatus.SUCCESS },
      ],
    };

    expect(
      getStepInfoHistoryItem({
        stepInfo,
        steps,
        stepId: 'step2',
        iterationIndex: 0,
      })?.result,
    ).toBe('first');
    expect(
      getStepInfoHistoryItem({
        stepInfo,
        steps,
        stepId: 'step2',
        iterationIndex: 1,
      })?.result,
    ).toBe('second');
    expect(
      getStepInfoHistoryItem({
        stepInfo,
        steps,
        stepId: 'step2',
        iterationIndex: 2,
      })?.result,
    ).toBe('final');
  });

  it('returns the last history item for a non-descendant', () => {
    const stepInfo: WorkflowRunStepInfo = {
      result: 'final',
      status: StepStatus.SUCCESS,
      history: [
        { result: 'first', status: StepStatus.SUCCESS },
        { result: 'second', status: StepStatus.SUCCESS },
      ],
    };

    expect(
      getStepInfoHistoryItem({
        stepInfo,
        steps,
        stepId: 'iterator1',
        iterationIndex: 0,
      })?.result,
    ).toBe('final');
  });

  it('returns undefined if iterationIndex is out of bounds', () => {
    const stepInfo: WorkflowRunStepInfo = {
      result: 'final',
      status: StepStatus.SUCCESS,
      history: [{ result: 'first', status: StepStatus.SUCCESS }],
    };

    expect(
      getStepInfoHistoryItem({
        stepInfo,
        steps,
        stepId: 'step2',
        iterationIndex: 5,
      }),
    ).toBeUndefined();
  });

  it('returns the only item if no history', () => {
    const stepInfo: WorkflowRunStepInfo = {
      result: 'only',
      status: StepStatus.SUCCESS,
    };

    expect(
      getStepInfoHistoryItem({
        stepInfo,
        steps,
        stepId: 'step2',
        iterationIndex: 0,
      })?.result,
    ).toBe('only');
  });
});
