/* @license Enterprise */

import { hasPriceCreditMetadataChanged } from 'src/engine/core-modules/billing/utils/has-price-credit-metadata-changed.util';

describe('hasPriceCreditMetadataChanged', () => {
  it('sees an edited member credit amount', () => {
    expect(
      hasPriceCreditMetadataChanged({
        previousMetadata: { member_credit_amount: '3000000' },
        nextMetadata: { member_credit_amount: '9000000' },
      }),
    ).toBe(true);
  });

  it('sees an edited credit amount', () => {
    expect(
      hasPriceCreditMetadataChanged({
        previousMetadata: { credit_amount: '5000000' },
        nextMetadata: { credit_amount: '10000000' },
      }),
    ).toBe(true);
  });

  it('ignores edits to other metadata', () => {
    expect(
      hasPriceCreditMetadataChanged({
        previousMetadata: { credit_amount: '5000000', isLegacy: 'false' },
        nextMetadata: { credit_amount: '5000000', isLegacy: 'true' },
      }),
    ).toBe(false);
  });

  it('sees the amounts of a price not stored yet', () => {
    expect(
      hasPriceCreditMetadataChanged({
        previousMetadata: null,
        nextMetadata: { credit_amount: '5000000' },
      }),
    ).toBe(true);
  });

  it('ignores a price not stored yet that carries no amount', () => {
    expect(
      hasPriceCreditMetadataChanged({
        previousMetadata: undefined,
        nextMetadata: {},
      }),
    ).toBe(false);
  });
});
