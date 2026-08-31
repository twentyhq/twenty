import {
  type WorkflowIfElseAction,
  type WorkflowIteratorAction,
} from '@/workflow/types/Workflow';
import { getReconnectedStepIds } from '@/workflow/workflow-diagram/utils/getReconnectedStepIds';
import { generateNodesAndEdgesForIfElseNode } from '@/workflow/workflow-diagram/utils/generateNodesAndEdgesForIfElseNode';
import { reconnectWorkflowStep } from '@/workflow/workflow-diagram/utils/reconnectWorkflowStep';

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
      retryOnFailure: { value: false },
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
  it('makes only editable branch arrows reconnectable and preserves branch identity', () => {
    const generateEdges = (workflowContext: 'workflow' | 'workflow-version') =>
      generateNodesAndEdgesForIfElseNode({
        step: ifElseStep,
        steps: ['old', 'other'].map((id) => ({
          ...iteratorStep,
          id,
        })),
        xPos: 0,
        yPos: 0,
        nodes: [],
        edges: [],
        workflowContext,
      }).edges;

    const editableEdges = generateEdges('workflow');

    expect(editableEdges).toHaveLength(3);
    expect(
      editableEdges.map((edge) => edge.data?.sourceConnectionOptions),
    ).toEqual([
      { connectedStepType: 'IF_ELSE', settings: { branchId: 'if' } },
      { connectedStepType: 'IF_ELSE', settings: { branchId: 'if' } },
      { connectedStepType: 'IF_ELSE', settings: { branchId: 'else' } },
    ]);
    expect(
      editableEdges.every(
        (edge) => edge.reconnectable === 'target' && edge.deletable === false,
      ),
    ).toBe(true);
    expect(
      generateEdges('workflow-version').every(
        (edge) => edge.reconnectable === false,
      ),
    ).toBe(true);
  });
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
