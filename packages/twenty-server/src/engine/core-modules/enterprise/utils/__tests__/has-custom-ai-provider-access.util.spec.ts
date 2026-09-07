/* @license Enterprise */

import { MAX_SEATS_WITHOUT_ENTERPRISE_KEY } from 'src/engine/core-modules/enterprise/constants/max-seats-without-enterprise-key.constant';
import { hasCustomAiProviderAccess } from 'src/engine/core-modules/enterprise/utils/has-custom-ai-provider-access.util';

describe('hasCustomAiProviderAccess', () => {
  const selfHosted = {
    isBillingEnabled: false,
    hasValidEnterprisePlan: false,
  };

  it('grants access below the seat threshold', () => {
    expect(
      hasCustomAiProviderAccess({
        ...selfHosted,
        seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY - 1,
      }),
    ).toBe(true);
  });

  it('grants access exactly at the seat threshold', () => {
    expect(
      hasCustomAiProviderAccess({
        ...selfHosted,
        seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY,
      }),
    ).toBe(true);
  });

  it('denies access one seat above the threshold', () => {
    expect(
      hasCustomAiProviderAccess({
        ...selfHosted,
        seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY + 1,
      }),
    ).toBe(false);
  });

  it('grants access above the threshold with a valid enterprise plan', () => {
    expect(
      hasCustomAiProviderAccess({
        isBillingEnabled: false,
        hasValidEnterprisePlan: true,
        seatCount: MAX_SEATS_WITHOUT_ENTERPRISE_KEY + 100,
      }),
    ).toBe(true);
  });

  it('grants access on a billing-enabled instance whatever its seat count', () => {
    expect(
      hasCustomAiProviderAccess({
        isBillingEnabled: true,
        hasValidEnterprisePlan: false,
        seatCount: 10_000,
      }),
    ).toBe(true);
  });
});
