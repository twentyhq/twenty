import { StepLogicalOperator, ViewFilterOperand } from 'twenty-shared/types';

import { removeIfElseBranchFilterRows } from '@/workflow/workflow-steps/workflow-actions/if-else-action/utils/removeIfElseBranchFilterRows';

const buildStepFilter = (id: string, stepFilterGroupId: string) => ({
  id,
  type: 'TEXT',
  operand: ViewFilterOperand.IS,
  value: 'Acme',
  stepOutputKey: '{{trigger.name}}',
  stepFilterGroupId,
});

describe('removeIfElseBranchFilterRows', () => {
  it("should drop the branch's filters and nested groups, and keep its own group and other branches", () => {
    const result = removeIfElseBranchFilterRows({
      branchFilterGroupId: 'if',
      stepFilterGroups: [
        { id: 'if', logicalOperator: StepLogicalOperator.AND },
        {
          id: 'if-any',
          logicalOperator: StepLogicalOperator.OR,
          parentStepFilterGroupId: 'if',
        },
        {
          id: 'if-any-all',
          logicalOperator: StepLogicalOperator.AND,
          parentStepFilterGroupId: 'if-any',
        },
        { id: 'else-if', logicalOperator: StepLogicalOperator.AND },
      ],
      stepFilters: [
        buildStepFilter('a', 'if'),
        buildStepFilter('b', 'if-any'),
        buildStepFilter('c', 'if-any-all'),
        buildStepFilter('d', 'else-if'),
      ],
    });

    expect(result.stepFilterGroups.map(({ id }) => id)).toEqual([
      'if',
      'else-if',
    ]);
    expect(result.stepFilters.map(({ id }) => id)).toEqual(['d']);
  });
});
