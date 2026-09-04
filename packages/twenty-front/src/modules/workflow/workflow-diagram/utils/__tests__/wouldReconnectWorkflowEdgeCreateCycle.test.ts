import { type WorkflowAction } from '@/workflow/types/Workflow';
import { wouldReconnectWorkflowEdgeCreateCycle } from '@/workflow/workflow-diagram/utils/wouldReconnectWorkflowEdgeCreateCycle';

const createAction = (id: string, nextStepIds: string[]): WorkflowAction => ({
  id,
  name: id,
  type: 'HTTP_REQUEST',
  valid: true,
  settings: {
    input: { method: 'GET', url: '', headers: {} },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
  nextStepIds,
});

const flow = {
  trigger: {
    type: 'MANUAL' as const,
    settings: { outputSchema: {} },
    nextStepIds: ['first'],
  },
  steps: [
    createAction('first', ['second']),
    createAction('second', ['third']),
    createAction('third', []),
    createAction('sibling', []),
  ],
};

describe('wouldReconnectWorkflowEdgeCreateCycle', () => {
  it('detects reconnecting to an ancestor', () => {
    expect(
      wouldReconnectWorkflowEdgeCreateCycle({
        flow,
        sourceStepId: 'third',
        targetStepId: 'first',
      }),
    ).toBe(true);
  });

  it('allows reconnecting to a non-ancestor', () => {
    expect(
      wouldReconnectWorkflowEdgeCreateCycle({
        flow,
        sourceStepId: 'first',
        targetStepId: 'sibling',
      }),
    ).toBe(false);
  });

  it('does not treat an iterator loopback as a cycle inside the loop', () => {
    const iterator = {
      id: 'iterator',
      name: 'For each contract',
      type: 'ITERATOR' as const,
      valid: true,
      nextStepIds: ['completed'],
      settings: {
        input: { items: [], initialLoopStepIds: ['loop-first'] },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: 0 },
          continueOnFailure: { value: false },
        },
      },
    };
    const loopFlow = {
      trigger: {
        type: 'MANUAL' as const,
        settings: { outputSchema: {} },
        nextStepIds: [iterator.id],
      },
      steps: [
        iterator,
        createAction('loop-first', ['loop-last']),
        createAction('loop-last', [iterator.id]),
        createAction('completed', []),
      ],
    };

    expect(
      wouldReconnectWorkflowEdgeCreateCycle({
        flow: loopFlow,
        sourceStepId: 'loop-first',
        targetStepId: 'loop-last',
      }),
    ).toBe(false);
  });
});
