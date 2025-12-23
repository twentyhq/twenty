import { type WorkflowStep } from '@/workflow/types/Workflow';
import { getIsDescendantOfIterator } from '@/workflow/workflow-steps/utils/getIsDescendantOfIterator';

describe('getIsDescendantOfIterator', () => {
  const iteratorStep: WorkflowStep = {
    id: 'iterator1',
    name: 'Iterator Step',
    type: 'ITERATOR',
    valid: true,
    nextStepIds: ['step3'],
    settings: {
      input: {
        initialLoopStepIds: ['step2'],
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: true },
        continueOnFailure: { value: true },
      },
    },
  };

  const codeStep2: WorkflowStep = {
    id: 'step2',
    name: 'Second Step',
    type: 'CODE',
    valid: true,
    nextStepIds: ['iterator1'],
    settings: {
      input: {
        serverlessFunctionId: 'func2',
        serverlessFunctionVersion: '1.0.0',
        serverlessFunctionInput: {},
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: true },
        continueOnFailure: { value: true },
      },
    },
  };

  const codeStep3: WorkflowStep = {
    id: 'step3',
    name: 'Third Step',
    type: 'CODE',
    valid: true,
    nextStepIds: [],
    settings: {
      input: {
        serverlessFunctionId: 'func3',
        serverlessFunctionVersion: '1.0.0',
        serverlessFunctionInput: {},
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: true },
        continueOnFailure: { value: true },
      },
    },
  };

  const workflow: WorkflowStep[] = [iteratorStep, codeStep2, codeStep3];

  it('returns true for direct loop step descendant', () => {
    expect(
      getIsDescendantOfIterator({ stepId: codeStep2.id, steps: workflow }),
    ).toBe(true);
  });

  it('returns false for indirect descendant', () => {
    expect(
      getIsDescendantOfIterator({ stepId: codeStep3.id, steps: workflow }),
    ).toBe(false);
  });

  it('returns false for iterator itself', () => {
    expect(
      getIsDescendantOfIterator({ stepId: iteratorStep.id, steps: workflow }),
    ).toBe(false);
  });

  it('returns false for step not connected to iterator', () => {
    const unrelatedStep: WorkflowStep = {
      id: 'step4',
      name: 'Unrelated Step',
      type: 'CODE',
      valid: true,
      nextStepIds: [],
      settings: {
        input: {
          serverlessFunctionId: 'func4',
          serverlessFunctionVersion: '1.0.0',
          serverlessFunctionInput: {},
        },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: true },
          continueOnFailure: { value: true },
        },
      },
    };
    expect(
      getIsDescendantOfIterator({
        stepId: unrelatedStep.id,
        steps: [...workflow, unrelatedStep],
      }),
    ).toBe(false);
  });
});
