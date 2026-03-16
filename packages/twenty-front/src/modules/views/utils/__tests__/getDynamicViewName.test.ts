import { getDynamicViewName } from '@/views/utils/getDynamicViewName';

describe('getDynamicViewName', () => {
  it('should replace objectLabelPlural token with current object label', () => {
    expect(getDynamicViewName('All {objectLabelPlural}', 'Pipelines')).toBe(
      'All Pipelines',
    );
  });

  it('should keep the original name when token is absent', () => {
    expect(getDynamicViewName('All Opportunities', 'Pipelines')).toBe(
      'All Opportunities',
    );
  });
});
