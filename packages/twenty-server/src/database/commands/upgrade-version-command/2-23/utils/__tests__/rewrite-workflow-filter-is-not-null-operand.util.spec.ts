import { ViewFilterOperand } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { rewriteWorkflowFilterIsNotNullOperand } from 'src/database/commands/upgrade-version-command/2-23/utils/rewrite-workflow-filter-is-not-null-operand.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const createFilterStep = (operands: string[]): WorkflowAction =>
  ({
    id: 'step-1',
    name: 'Filter',
    type: WorkflowActionType.FILTER,
    valid: true,
    settings: {
      input: {
        stepFilters: operands.map((operand, index) => ({
          id: `filter-${index}`,
          type: 'RELATION',
          operand,
          value: '',
          stepOutputKey: 'trigger.record',
          stepFilterGroupId: 'group-1',
        })),
        stepFilterGroups: [],
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
    },
  }) as unknown as WorkflowAction;

const getOperands = (steps: WorkflowAction[] | null): (string | undefined)[] =>
  (steps?.[0] as WorkflowAction & { settings: { input: { stepFilters: { operand: string }[] } } }).settings.input.stepFilters.map(
    (filter) => filter.operand,
  );

describe('rewriteWorkflowFilterIsNotNullOperand', () => {
  it('rewrites the deprecated camelCase isNotNull operand to IS_NOT_EMPTY', () => {
    const result = rewriteWorkflowFilterIsNotNullOperand([
      createFilterStep(['isNotNull']),
    ]);

    expect(result.changed).toBe(true);
    expect(getOperands(result.value)).toEqual([ViewFilterOperand.IS_NOT_EMPTY]);
  });

  it('rewrites the normalized IS_NOT_NULL operand to IS_NOT_EMPTY', () => {
    const result = rewriteWorkflowFilterIsNotNullOperand([
      createFilterStep(['IS_NOT_NULL']),
    ]);

    expect(result.changed).toBe(true);
    expect(getOperands(result.value)).toEqual([ViewFilterOperand.IS_NOT_EMPTY]);
  });

  it('leaves supported operands untouched', () => {
    const result = rewriteWorkflowFilterIsNotNullOperand([
      createFilterStep([
        ViewFilterOperand.IS,
        ViewFilterOperand.IS_NOT_EMPTY,
        ViewFilterOperand.IS_EMPTY,
      ]),
    ]);

    expect(result.changed).toBe(false);
    expect(getOperands(result.value)).toEqual([
      ViewFilterOperand.IS,
      ViewFilterOperand.IS_NOT_EMPTY,
      ViewFilterOperand.IS_EMPTY,
    ]);
  });

  it('only rewrites the affected operands within a mixed filter set', () => {
    const result = rewriteWorkflowFilterIsNotNullOperand([
      createFilterStep([ViewFilterOperand.IS, 'IS_NOT_NULL']),
    ]);

    expect(result.changed).toBe(true);
    expect(getOperands(result.value)).toEqual([
      ViewFilterOperand.IS,
      ViewFilterOperand.IS_NOT_EMPTY,
    ]);
  });

  it('ignores non-filter steps', () => {
    const otherStep = {
      id: 'step-1',
      type: WorkflowActionType.CODE,
      settings: { input: {} },
    } as unknown as WorkflowAction;

    const result = rewriteWorkflowFilterIsNotNullOperand([otherStep]);

    expect(result.changed).toBe(false);
  });

  it('handles null steps', () => {
    const result = rewriteWorkflowFilterIsNotNullOperand(null);

    expect(result.changed).toBe(false);
    expect(result.value).toBeNull();
  });
});
