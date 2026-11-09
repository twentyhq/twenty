import { getNewPageLayoutFilterLabel } from '@/page-layout/utils/getNewPageLayoutFilterLabel';

const buildFilters = (labels: string[]) => labels.map((label) => ({ label }));

describe('getNewPageLayoutFilterLabel', () => {
  it('should name the first filter Period', () => {
    expect(getNewPageLayoutFilterLabel([])).toBe('Period');
  });

  it('should number the next filter', () => {
    expect(getNewPageLayoutFilterLabel(buildFilters(['Period']))).toBe(
      'Period 2',
    );
  });

  it('should take the first unused number, not the filter count', () => {
    expect(getNewPageLayoutFilterLabel(buildFilters(['Period 2']))).toBe(
      'Period',
    );
    expect(
      getNewPageLayoutFilterLabel(buildFilters(['Period', 'Period 3'])),
    ).toBe('Period 2');
  });
});
