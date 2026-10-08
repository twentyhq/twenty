/* @license Enterprise */

import { isCreditTopUpInvoice } from 'src/engine/core-modules/billing/utils/is-credit-top-up-invoice.util';

describe('isCreditTopUpInvoice', () => {
  it('recognizes an invoice tagged as a credit top-up', () => {
    expect(isCreditTopUpInvoice({ metadata: { kind: 'CREDIT_TOP_UP' } })).toBe(
      true,
    );
  });

  it('ignores an invoice with another kind', () => {
    expect(isCreditTopUpInvoice({ metadata: { kind: 'OTHER' } })).toBe(false);
  });

  it('ignores an invoice without metadata', () => {
    expect(isCreditTopUpInvoice({ metadata: null })).toBe(false);
    expect(isCreditTopUpInvoice({ metadata: {} })).toBe(false);
  });
});
