import { formatCompositeFilters } from '~/utils/array/formatCompositeFilters.ts';

describe('formatCompositeFilters', () => {
  it('should format composite filters for simple filter string', () => {
    expect(formatCompositeFilters('john')).toEqual([
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
    ]);
  });
  it('should format composite filters for complex filter string', () => {
    expect(formatCompositeFilters('john doe')).toEqual([
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
