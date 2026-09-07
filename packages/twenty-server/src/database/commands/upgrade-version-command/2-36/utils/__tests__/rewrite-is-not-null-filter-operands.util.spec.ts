import { rewriteIsNotNullFilterOperands } from 'src/database/commands/upgrade-version-command/2-36/utils/rewrite-is-not-null-filter-operands.util';

describe('rewriteIsNotNullFilterOperands', () => {
  it('rewrites IS_NOT_NULL operand to IS_NOT_EMPTY inside stepFilters', () => {
    const steps = [
      {
        type: 'IF_ELSE',
        settings: {
          input: {
            stepFilters: [
              { id: 'a', type: 'UUID', operand: 'IS_NOT_NULL', value: '' },
            ],
          },
        },
      },
    ];

    const { value, changed } = rewriteIsNotNullFilterOperands(steps);

    expect(changed).toBe(true);
    expect(value[0].settings.input.stepFilters[0].operand).toBe('IS_NOT_EMPTY');
  });

  it('rewrites the deprecated isNotNull operand to IS_NOT_EMPTY', () => {
    const { value, changed } = rewriteIsNotNullFilterOperands({
      stepFilters: [{ operand: 'isNotNull' }],
    });

    expect(changed).toBe(true);
    expect(value.stepFilters[0].operand).toBe('IS_NOT_EMPTY');
  });

  it('rewrites operands in trigger filter settings', () => {
    const trigger = {
      type: 'DATABASE_EVENT',
      settings: {
        eventName: 'company.updated',
        filter: {
          stepFilters: [{ operand: 'IS_NOT_NULL' }],
          stepFilterGroups: [],
        },
      },
    };

    const { value, changed } = rewriteIsNotNullFilterOperands(trigger);

    expect(changed).toBe(true);
    expect(value.settings.filter.stepFilters[0].operand).toBe('IS_NOT_EMPTY');
  });

  it('leaves other operands untouched', () => {
    const steps = [
      { settings: { input: { stepFilters: [{ operand: 'IS_NOT_EMPTY' }] } } },
      { settings: { input: { stepFilters: [{ operand: 'IS' }] } } },
    ];

    const { value, changed } = rewriteIsNotNullFilterOperands(steps);

    expect(changed).toBe(false);
    expect(value).toBe(steps);
  });

  it('does not touch a filter value that merely contains the operand string', () => {
    const { value, changed } = rewriteIsNotNullFilterOperands({
      stepFilters: [{ operand: 'CONTAINS', value: 'IS_NOT_NULL' }],
    });

    expect(changed).toBe(false);
    expect(value.stepFilters[0].value).toBe('IS_NOT_NULL');
  });

  it('is idempotent', () => {
    const input = { stepFilters: [{ operand: 'IS_NOT_NULL' }] };

    const firstPass = rewriteIsNotNullFilterOperands(input);
    const secondPass = rewriteIsNotNullFilterOperands(firstPass.value);

    expect(firstPass.changed).toBe(true);
    expect(secondPass.changed).toBe(false);
    expect(secondPass.value).toEqual({
      stepFilters: [{ operand: 'IS_NOT_EMPTY' }],
    });
  });

  it('returns null/undefined unchanged', () => {
    expect(rewriteIsNotNullFilterOperands(null)).toEqual({
      value: null,
      changed: false,
    });
    expect(rewriteIsNotNullFilterOperands(undefined)).toEqual({
      value: undefined,
      changed: false,
    });
  });
});
