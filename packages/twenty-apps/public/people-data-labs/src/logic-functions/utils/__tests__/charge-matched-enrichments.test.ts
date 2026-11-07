import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chargeCredits } from 'twenty-sdk/billing';

import { COMPANY_MATCH_PRICE_DOLLARS } from 'src/constants/company-match-price-dollars';
import { PERSON_MATCH_PRICE_DOLLARS } from 'src/constants/person-match-price-dollars';
import { chargeMatchedEnrichments } from 'src/logic-functions/utils/charge-matched-enrichments';

vi.mock('twenty-sdk/billing', () => ({
  chargeCredits: vi.fn(async () => undefined),
}));

describe('chargeMatchedEnrichments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('charges 15 cents per person match', async () => {
    await chargeMatchedEnrichments({
      matchedCount: 3,
      pricePerMatchDollars: PERSON_MATCH_PRICE_DOLLARS,
      resourceContext: 'pdl/person',
    });

    expect(chargeCredits).toHaveBeenCalledExactlyOnceWith({
      creditsUsedMicro: 450_000,
      operationType: 'CODE_EXECUTION',
      quantity: 3,
      resourceContext: 'pdl/person',
    });
  });

  it('charges 7.5 cents per company match', async () => {
    await chargeMatchedEnrichments({
      matchedCount: 2,
      pricePerMatchDollars: COMPANY_MATCH_PRICE_DOLLARS,
      resourceContext: 'pdl/company',
    });

    expect(chargeCredits).toHaveBeenCalledExactlyOnceWith({
      creditsUsedMicro: 150_000,
      operationType: 'CODE_EXECUTION',
      quantity: 2,
      resourceContext: 'pdl/company',
    });
  });

  it('does not charge when nothing matched', async () => {
    await chargeMatchedEnrichments({
      matchedCount: 0,
      pricePerMatchDollars: PERSON_MATCH_PRICE_DOLLARS,
      resourceContext: 'pdl/person',
    });

    expect(chargeCredits).not.toHaveBeenCalled();
  });
});
