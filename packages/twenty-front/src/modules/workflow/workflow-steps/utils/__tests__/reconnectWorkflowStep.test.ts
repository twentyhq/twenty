import {
  type WorkflowIfElseAction,
  type WorkflowIteratorAction,
} from '@/workflow/types/Workflow';
import { getReconnectedStepIds } from '@/workflow/workflow-steps/utils/getReconnectedStepIds';
import { reconnectWorkflowStep } from '@/workflow/workflow-steps/utils/reconnectWorkflowStep';

const ifElseStep: WorkflowIfElseAction = {
  id: 'if-else',
  name: 'Contract type',
  type: 'IF_ELSE',
  valid: true,
  settings: {
    input: {
      stepFilterGroups: [],
      stepFilters: [],
      branches: [
        { id: 'if', filterGroupId: 'filter-if', nextStepIds: ['old', 'other'] },
        { id: 'else', nextStepIds: ['old'] },
      ],
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
};

const iteratorStep: WorkflowIteratorAction = {
  id: 'iterator',
  name: 'For each contract',
  type: 'ITERATOR',
  valid: true,
  nextStepIds: ['completed'],
  settings: {
    ...ifElseStep.settings,
    input: { items: [], initialLoopStepIds: ['old'] },
  },
};

describe('getReconnectedStepIds', () => {
  it('replaces only the selected connection and keeps its position', () => {
    expect(
      getReconnectedStepIds({
        nextStepIds: ['first', 'old', 'last'],
        oldTargetId: 'old',
        newTargetId: 'new',
      }),
    ).toEqual(['first', 'new', 'last']);
  });

  it.each([undefined, [], ['missing'], ['old', 'new']])(
    'rejects stale and duplicate connections: %j',
    (nextStepIds) => {
      expect(
        getReconnectedStepIds({
          nextStepIds,
          oldTargetId: 'old',
          newTargetId: 'new',
        }),
      ).toBeUndefined();
    },
  );
});

describe('reconnectWorkflowStep', () => {
  it.each(['if', 'else'])(
    'reconnects the selected %s branch without changing the other branch',
    (branchId) => {
      const result = reconnectWorkflowStep({
        step: ifElseStep,
        oldTargetId: 'old',
        newTargetId: 'new',
        connectionOptions: {
          connectedStepType: 'IF_ELSE',
          settings: { branchId },
        },
      });

      expect(result?.settings.input).toEqual({
        ...ifElseStep.settings.input,
        branches: ifElseStep.settings.input.branches.map((branch) =>
          branch.id === branchId
            ? {
                ...branch,
                nextStepIds: branch.nextStepIds.map((id) =>
                  id === 'old' ? 'new' : id,
                ),
              }
            : branch,
        ),
      });
      expect(result?.settings.errorHandlingOptions).toEqual(
        ifElseStep.settings.errorHandlingOptions,
      );
      expect(
        ifElseStep.settings.input.branches.map((branch) => branch.nextStepIds),
      ).toEqual([['old', 'other'], ['old']]);
    },
  );

  it('requires an explicit branch to reconnect an If/Else step', () => {
    expect(
      reconnectWorkflowStep({
        step: ifElseStep,
        oldTargetId: 'old',
        newTargetId: 'new',
      }),
    ).toBeUndefined();
  });

  it('reconnects a loop without changing the iterator completion branch', () => {
    const result = reconnectWorkflowStep({
      step: iteratorStep,
      oldTargetId: 'old',
      newTargetId: 'new',
      connectionOptions: {
        connectedStepType: 'ITERATOR',
        settings: { isConnectedToLoop: true },
      },
    });
    expect(result).toEqual({
      ...iteratorStep,
      settings: {
        ...iteratorStep.settings,
        input: { ...iteratorStep.settings.input, initialLoopStepIds: ['new'] },
      },
    });
  });

  it('reconnects a legacy serialized iterator loop edge', () => {
    const legacyIteratorStep = structuredClone(iteratorStep);
    Object.assign(legacyIteratorStep.settings.input, {
      initialLoopStepIds: 'old',
    });

    expect(
      reconnectWorkflowStep({
        step: legacyIteratorStep,
        oldTargetId: 'old',
        newTargetId: 'new',
        connectionOptions: {
          connectedStepType: 'ITERATOR',
          settings: { isConnectedToLoop: true },
        },
      }),
    ).toMatchObject({
      settings: {
        input: { initialLoopStepIds: ['new'] },
      },
    });
  });

  it('reconnects the iterator completion branch without changing the loop', () => {
    expect(
      reconnectWorkflowStep({
        step: iteratorStep,
        oldTargetId: 'completed',
        newTargetId: 'new',
      }),
    ).toEqual({ ...iteratorStep, nextStepIds: ['new'] });
  });

  it('rejects self-connections', () => {
    expect(
      reconnectWorkflowStep({
        step: iteratorStep,
        oldTargetId: 'completed',
        newTargetId: iteratorStep.id,
      }),
    ).toBeUndefined();
  });
});
