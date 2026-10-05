import { stripGraphqlTypename } from '@/cli/utilities/pull/strip-graphql-typename';
import { describe, expect, it } from 'vitest';

describe('stripGraphqlTypename', () => {
  it('should drop __typename keys at every depth and keep everything else, nulls included', () => {
    expect(
      stripGraphqlTypename({
        __typename: 'PageLayoutWidget',
        title: 'People',
        configuration: {
          __typename: 'RecordTableConfiguration',
          configurationType: 'RECORD_TABLE',
          recordLimit: null,
          filter: {
            recordFilters: [
              { __typename: 'ChartFilter', value: null, operand: 'is' },
            ],
          },
        },
      }),
    ).toEqual({
      title: 'People',
      configuration: {
        configurationType: 'RECORD_TABLE',
        recordLimit: null,
        filter: { recordFilters: [{ value: null, operand: 'is' }] },
      },
    });
  });

  it('should return scalars and arrays unchanged', () => {
    expect(stripGraphqlTypename('People')).toBe('People');
    expect(stripGraphqlTypename(null)).toBeNull();
    expect(stripGraphqlTypename([1, 'two', null])).toEqual([1, 'two', null]);
  });
});
