import { hasFilledStepFilter } from '@/workflow/workflow-steps/conditions/utils/hasFilledStepFilter';

describe('hasFilledStepFilter', () => {
  it('ignores rows without a field', () => {
    expect(hasFilledStepFilter([{ stepOutputKey: '' }])).toBe(false);
    expect(hasFilledStepFilter([])).toBe(false);
  });

  it('counts a row with a field', () => {
    expect(
      hasFilledStepFilter([
        { stepOutputKey: '' },
        { stepOutputKey: '{{trigger.properties.after.name}}' },
      ]),
    ).toBe(true);
  });
});
