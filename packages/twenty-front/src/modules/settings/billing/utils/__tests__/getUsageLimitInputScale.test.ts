import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';

import { getUsageLimitInputScale } from '@/settings/billing/utils/getUsageLimitInputScale';
import { UsageUnit } from '~/generated-metadata/graphql';

describe('getUsageLimitInputScale', () => {
  it('scales workspace and member credits, which are stored in micro-credits', () => {
    expect(getUsageLimitInputScale(UsageUnit.CREDIT)).toBe(
      INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
    );
    expect(getUsageLimitInputScale(UsageUnit.USER_CREDIT)).toBe(
      INTERNAL_CREDITS_PER_DISPLAY_CREDIT,
    );
  });

  it('leaves other units as typed', () => {
    expect(getUsageLimitInputScale(UsageUnit.INVOCATION)).toBe(1);
    expect(getUsageLimitInputScale(null)).toBe(1);
  });
});
