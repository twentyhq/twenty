import { generateILikeFilters } from '~/utils/array/generateILikeFilters.ts';

describe('formatCompositeFilters', () => {
  it('should format composite filters for simple filter string', () => {
    expect(
      generateILikeFilters('john', 'baseField', ['subField1', 'subField2']),
    ).toEqual([
      {
        baseField: {
          subField1: {
            ilike: '%john%',
          },
        },
      },
      {
        baseField: {
          subField2: {
            ilike: '%john%',
          },
        },
      },
    ]);
  });
  it('should format composite filters for complex filter string', () => {
    expect(
      generateILikeFilters('john doe', 'name', ['firstName', 'lastName']),
    ).toEqual([
      {
        name: {
          firstName: {
            ilike: '%john%',
          },
        },
      },
      {
        name: {
          lastName: {
            ilike: '%john%',
          },
        },
      },
      {
        name: {
          firstName: {
            ilike: '%doe%',
          },
        },
      },
      {
        name: {
          lastName: {
            ilike: '%doe%',
          },
        },
      },
    ]);
  });
});
