import {
  type WorkflowIteratorAction,
  type WorkflowStep,
} from '@/workflow/types/Workflow';
import { isLastStepOfLoop } from '@/workflow/workflow-diagram/utils/isLastStepOfLoop';

describe('isLastStepOfLoop', () => {
  const makeIterator = (
    id: string,
    initialLoopStepIds: string[],
  ): WorkflowIteratorAction => ({
    id,
    type: 'ITERATOR',
    settings: {
      input: { initialLoopStepIds },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
    },
    name: 'Iterator',
    valid: true,
  });

  const makeStep = (id: string, nextStepIds: string[] = []): WorkflowStep =>
    ({
      id,
      type: 'CODE',
      nextStepIds,
      name: id,
      valid: true,
      settings: {},
    }) as WorkflowStep;

  it('returns true when step is last before looping back to iterator', () => {
    const iterator = makeIterator('iterator', ['A']);
    const steps = [
      makeStep('A', ['B']),
      makeStep('B', ['iterator']),
      makeStep('iterator', []),
    ];
    expect(isLastStepOfLoop({ iterator, stepId: 'B', steps })).toBe(true);
  });

  it('returns false when step is not last before looping back', () => {
    const iterator = makeIterator('iterator', ['A']);
    const steps = [
      makeStep('A', ['B']),
      makeStep('B', ['C']),
      makeStep('C', ['iterator']),
      makeStep('iterator', []),
    ];
    expect(isLastStepOfLoop({ iterator, stepId: 'B', steps })).toBe(false);
  });

  it('returns false if step is not in loop', () => {
    const iterator = makeIterator('iterator', ['A']);
    const steps = [
      makeStep('A', ['B']),
      makeStep('B', ['iterator']),
      makeStep('iterator', []),
    ];
    expect(isLastStepOfLoop({ iterator, stepId: 'X', steps })).toBe(false);
  });

  it('returns false if loop never reaches step', () => {
    const iterator = makeIterator('iterator', ['A']);
    const steps = [makeStep('A', ['iterator']), makeStep('iterator', [])];
    expect(isLastStepOfLoop({ iterator, stepId: 'B', steps })).toBe(false);
  });

  it('returns false if step does not point to iterator', () => {
    const iterator = makeIterator('iterator', ['A']);
    const steps = [
      makeStep('A', ['B']),
      makeStep('B', ['C']),
      makeStep('C', ['iterator']),
      makeStep('iterator', []),
    ];
    expect(isLastStepOfLoop({ iterator, stepId: 'B', steps })).toBe(false);
  });

  it('handles cycles and does not infinite loop, still finds last step', () => {
    const iterator = makeIterator('iterator', ['A']);
    const steps = [
      makeStep('A', ['B']),
      makeStep('B', ['A', 'iterator']),
      makeStep('iterator', []),
    ];
    expect(isLastStepOfLoop({ iterator, stepId: 'B', steps })).toBe(true);
  });

  it('continues processing even if revisiting iterator node', () => {
    const iterator = makeIterator('iterator', ['A']);
    const steps = [
      makeStep('A', ['iterator', 'B']),
      makeStep('B', ['iterator']),
      makeStep('iterator', ['A']),
    ];
    // B is reachable after revisiting iterator, and points to iterator
    expect(isLastStepOfLoop({ iterator, stepId: 'B', steps })).toBe(true);
  });

  it('returns true if multiple initialLoopStepIds and one is last', () => {
    const iterator = makeIterator('iterator', ['A', 'X']);
    const steps = [
      makeStep('A', ['B']),
      makeStep('B', ['iterator']),
      makeStep('X', ['Y']),
      makeStep('Y', ['iterator']),
      makeStep('iterator', []),
    ];
    expect(isLastStepOfLoop({ iterator, stepId: 'B', steps })).toBe(true);
    expect(isLastStepOfLoop({ iterator, stepId: 'Y', steps })).toBe(true);
  });
});
