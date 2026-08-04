import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chargeCredits } from 'twenty-sdk/billing';

import { COMPANY_MATCH_COST_DOLLARS } from 'src/constants/company-match-cost-dollars';
import { PERSON_MATCH_COST_DOLLARS } from 'src/constants/person-match-cost-dollars';
import { chargeMatchedEnrichments } from 'src/logic-functions/utils/charge-matched-enrichments';

vi.mock('twenty-sdk/billing', () => ({
  chargeCredits: vi.fn(async () => undefined),
}));

describe('chargeMatchedEnrichments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('charges person matches at PDL list price plus margin', async () => {
    await chargeMatchedEnrichments({
      matchedCount: 3,
      costPerMatchDollars: PERSON_MATCH_COST_DOLLARS,
      resourceContext: 'pdl/person',
    });

    expect(chargeCredits).toHaveBeenCalledExactlyOnceWith({
      creditsUsedMicro: 3 * 336_000,
      operationType: 'CODE_EXECUTION',
      quantity: 3,
      resourceContext: 'pdl/person',
    });
  });

  it('charges company matches at PDL list price plus margin', async () => {
    await chargeMatchedEnrichments({
      matchedCount: 2,
      costPerMatchDollars: COMPANY_MATCH_COST_DOLLARS,
      resourceContext: 'pdl/company',
    });

    expect(chargeCredits).toHaveBeenCalledExactlyOnceWith({
      creditsUsedMicro: 2 * 120_000,
      operationType: 'CODE_EXECUTION',
      quantity: 2,
      resourceContext: 'pdl/company',
    });
  });

  it('does not charge when nothing matched', async () => {
    await chargeMatchedEnrichments({
      matchedCount: 0,
      costPerMatchDollars: PERSON_MATCH_COST_DOLLARS,
      resourceContext: 'pdl/person',
    });

    expect(chargeCredits).not.toHaveBeenCalled();
  });
});
