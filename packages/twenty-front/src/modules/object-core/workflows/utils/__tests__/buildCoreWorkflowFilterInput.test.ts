import { StepLogicalOperator, ViewFilterOperand } from 'twenty-shared/types';

import { CORE_WORKFLOW_FILTER_FIELDS } from '@/object-core/workflows/constants/CoreWorkflowFilterFields';
import { buildCoreWorkflowFilterInput } from '@/object-core/workflows/utils/buildCoreWorkflowFilterInput';
import { getStepFilterOperands } from '@/workflow/workflow-steps/filters/utils/getStepFilterOperands';
import {
  CoreWorkflowFilterFieldKey,
  CoreWorkflowFilterLogicalOperator,
  CoreWorkflowFilterOperand,
} from '~/generated/graphql';

const buildStepFilter = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'filter-1',
    type: 'TEXT',
    stepOutputKey: CoreWorkflowFilterFieldKey.NAME,
    operand: ViewFilterOperand.CONTAINS,
    value: 'sync',
    stepFilterGroupId: 'group-1',
    ...overrides,
  }) as never;

describe('buildCoreWorkflowFilterInput', () => {
  it('should return undefined when there is no usable rule', () => {
    expect(buildCoreWorkflowFilterInput({})).toBeUndefined();
    expect(
      buildCoreWorkflowFilterInput({
        stepFilters: [buildStepFilter({ value: '' })],
      }),
    ).toBeUndefined();
  });

  it('should map a text rule', () => {
    expect(
      buildCoreWorkflowFilterInput({ stepFilters: [buildStepFilter()] }),
    ).toEqual({
      logicalOperator: CoreWorkflowFilterLogicalOperator.AND,
      rules: [
        {
          fieldKey: CoreWorkflowFilterFieldKey.NAME,
          operand: CoreWorkflowFilterOperand.CONTAINS,
          value: 'sync',
        },
      ],
    });
  });

  it('should keep the root logical operator', () => {
    expect(
      buildCoreWorkflowFilterInput({
        stepFilters: [buildStepFilter()],
        stepFilterGroups: [
          { id: 'group-1', logicalOperator: StepLogicalOperator.OR },
        ],
      })?.logicalOperator,
    ).toBe(CoreWorkflowFilterLogicalOperator.OR);
  });

  it('should send no value for value-less operands', () => {
    expect(
      buildCoreWorkflowFilterInput({
        stepFilters: [
          buildStepFilter({ operand: ViewFilterOperand.IS_EMPTY, value: '' }),
        ],
      })?.rules[0],
    ).toEqual({
      fieldKey: CoreWorkflowFilterFieldKey.NAME,
      operand: CoreWorkflowFilterOperand.IS_EMPTY,
      value: null,
    });
  });

  it('should drop a rule whose multi select value has no option left', () => {
    expect(
      buildCoreWorkflowFilterInput({
        stepFilters: [
          buildStepFilter({
            stepOutputKey: CoreWorkflowFilterFieldKey.STATUSES,
            operand: ViewFilterOperand.CONTAINS,
            value: JSON.stringify([]),
          }),
        ],
      }),
    ).toBeUndefined();
  });

  it('should drop rules on unknown fields', () => {
    expect(
      buildCoreWorkflowFilterInput({
        stepFilters: [buildStepFilter({ stepOutputKey: 'unknown' })],
      }),
    ).toBeUndefined();
  });

  const fieldOperandPairs = CORE_WORKFLOW_FILTER_FIELDS.flatMap((field) =>
    getStepFilterOperands({
      filterType: field.filterType,
      subFieldName: undefined,
    }).map((operand) => [field.key, operand] as const),
  );

  it.each(fieldOperandPairs)(
    'should map every operand the builder offers on %s (%s)',
    (fieldKey, operand) => {
      const rules = buildCoreWorkflowFilterInput({
        stepFilters: [
          buildStepFilter({ stepOutputKey: fieldKey, operand, value: 'sync' }),
        ],
      })?.rules;

      expect(rules).toHaveLength(1);
    },
  );
});
