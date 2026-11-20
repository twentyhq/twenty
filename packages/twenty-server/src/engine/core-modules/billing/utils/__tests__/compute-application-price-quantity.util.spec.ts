/* @license Enterprise */

import { computeApplicationPriceQuantity } from 'src/engine/core-modules/billing/utils/compute-application-price-quantity.util';

describe('computeApplicationPriceQuantity', () => {
  it.each([
    ['a flat price', undefined, 1],
    ['a persisted flat price with a null unit', null, 1],
    ['a price per workspace member', 'WORKSPACE_MEMBER' as const, 7],
  ])('bills %s', (_, per, quantity) => {
    expect(
      computeApplicationPriceQuantity({ per, workspaceMemberCount: 7 }),
    ).toBe(quantity);
  });
});
