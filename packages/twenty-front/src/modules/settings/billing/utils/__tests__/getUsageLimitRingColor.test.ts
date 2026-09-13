import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getUsageLimitRingColor } from '@/settings/billing/utils/getUsageLimitRingColor';

describe('getUsageLimitRingColor', () => {
  it('stays blue while the limit is comfortable', () => {
    expect(
      getUsageLimitRingColor({ consumedPercentage: 60, isExhausted: false }),
    ).toBe(themeCssVariables.color.blue);
  });

  it('turns orange past 60%', () => {
    expect(
      getUsageLimitRingColor({ consumedPercentage: 61, isExhausted: false }),
    ).toBe(themeCssVariables.color.orange);
  });

  it('turns red past 80%', () => {
    expect(
      getUsageLimitRingColor({ consumedPercentage: 81, isExhausted: false }),
    ).toBe(themeCssVariables.color.red);
  });

  it('turns red as soon as nothing is left, whatever the rounded percentage', () => {
    expect(
      getUsageLimitRingColor({ consumedPercentage: 12, isExhausted: true }),
    ).toBe(themeCssVariables.color.red);
  });
});
