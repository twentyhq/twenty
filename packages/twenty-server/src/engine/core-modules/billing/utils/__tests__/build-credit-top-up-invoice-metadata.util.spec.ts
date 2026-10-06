/* @license Enterprise */

import { buildCreditTopUpInvoiceMetadata } from 'src/engine/core-modules/billing/utils/build-credit-top-up-invoice-metadata.util';
import { isCreditTopUpInvoice } from 'src/engine/core-modules/billing/utils/is-credit-top-up-invoice.util';
import { parseCreditTopUpInvoiceMetadata } from 'src/engine/core-modules/billing/utils/parse-credit-top-up-invoice-metadata.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const USER_ID = '20202020-9e3b-46d4-a556-88b9ddc2b034';

describe('buildCreditTopUpInvoiceMetadata', () => {
  it('writes metadata the paid-invoice webhook reads back', () => {
    const metadata = buildCreditTopUpInvoiceMetadata({
      workspaceId: WORKSPACE_ID,
      userId: USER_ID,
      creditAmountMicro: 500_000_000,
    }) as Record<string, string>;

    expect(isCreditTopUpInvoice({ metadata })).toBe(true);
    expect(parseCreditTopUpInvoiceMetadata(metadata)).toEqual({
      workspaceId: WORKSPACE_ID,
      creditAmountMicro: 500_000_000,
    });
    expect(metadata.userId).toBe(USER_ID);
  });
});
