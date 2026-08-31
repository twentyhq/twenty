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
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  },
  nextStepIds,
});

const flow = {
  trigger: { type: 'MANUAL' as const, settings: {}, nextStepIds: ['first'] },
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
});
