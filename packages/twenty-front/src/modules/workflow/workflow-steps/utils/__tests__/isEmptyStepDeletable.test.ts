import { type WorkflowAction } from '@/workflow/types/Workflow';
import { isEmptyStepDeletable } from '@/workflow/workflow-steps/utils/isEmptyStepDeletable';

const EMPTY_STEP_ID = 'empty-step-id';

const createEmptyStep = (id: string): WorkflowAction =>
  ({
    id,
    name: 'Add an Action',
    type: 'EMPTY',
    valid: true,
    settings: {
      outputSchema: {},
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: false },
      },
      input: {},
    },
  }) as WorkflowAction;

const createIfElseStep = (
  branches: Array<{ filterGroupId?: string; nextStepIds: string[] }>,
): WorkflowAction =>
  ({
    id: 'if-else-step-id',
    name: 'If/Else',
    type: 'IF_ELSE',
    valid: true,
    settings: {
      outputSchema: {},
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: false },
      },
      input: {
        stepFilterGroups: [],
        stepFilters: [],
        branches: branches.map((branch, branchIndex) => ({
          id: `branch-${branchIndex}`,
          filterGroupId: branch.filterGroupId,
          nextStepIds: branch.nextStepIds,
        })),
      },
    },
  }) as WorkflowAction;

describe('isEmptyStepDeletable', () => {
  it('should return true when the step is not attached to an If/Else branch', () => {
    expect(
      isEmptyStepDeletable({
        stepId: EMPTY_STEP_ID,
        steps: [createEmptyStep(EMPTY_STEP_ID)],
      }),
    ).toBe(true);
  });

  it('should return true when there are no steps', () => {
    expect(isEmptyStepDeletable({ stepId: EMPTY_STEP_ID, steps: null })).toBe(
      true,
    );
  });

  it('should return false when the step is the only child of the if branch', () => {
    const steps = [
      createIfElseStep([
        { filterGroupId: 'filter-group-1', nextStepIds: [EMPTY_STEP_ID] },
        { nextStepIds: ['other-step-id'] },
      ]),
      createEmptyStep(EMPTY_STEP_ID),
    ];

    expect(isEmptyStepDeletable({ stepId: EMPTY_STEP_ID, steps })).toBe(false);
  });

  it('should return false when the step is the only child of the else branch', () => {
    const steps = [
      createIfElseStep([
        { filterGroupId: 'filter-group-1', nextStepIds: ['other-step-id'] },
        { nextStepIds: [EMPTY_STEP_ID] },
      ]),
      createEmptyStep(EMPTY_STEP_ID),
    ];

    expect(isEmptyStepDeletable({ stepId: EMPTY_STEP_ID, steps })).toBe(false);
  });

  it('should return true when the step is the child of an else-if branch', () => {
    const steps = [
      createIfElseStep([
        { filterGroupId: 'filter-group-1', nextStepIds: ['other-step-id'] },
        { filterGroupId: 'filter-group-2', nextStepIds: [EMPTY_STEP_ID] },
        { nextStepIds: ['another-step-id'] },
      ]),
      createEmptyStep(EMPTY_STEP_ID),
    ];

    expect(isEmptyStepDeletable({ stepId: EMPTY_STEP_ID, steps })).toBe(true);
  });

  it('should return true when the if branch has another child left', () => {
    const steps = [
      createIfElseStep([
        {
          filterGroupId: 'filter-group-1',
          nextStepIds: [EMPTY_STEP_ID, 'other-step-id'],
        },
        { nextStepIds: ['another-step-id'] },
      ]),
      createEmptyStep(EMPTY_STEP_ID),
    ];

    expect(isEmptyStepDeletable({ stepId: EMPTY_STEP_ID, steps })).toBe(true);
  });
});
