/* @license Enterprise */

import { getCustomerIdFromInvoice } from 'src/engine/core-modules/billing-webhook/utils/get-customer-id-from-invoice.util';

describe('getCustomerIdFromInvoice', () => {
  it('reads an unexpanded customer id', () => {
    expect(getCustomerIdFromInvoice({ customer: 'cus_unexpanded' })).toBe(
      'cus_unexpanded',
    );
  });

  it('reads the id of an expanded customer', () => {
    expect(
      getCustomerIdFromInvoice({
        customer: { id: 'cus_deleted', object: 'customer', deleted: true },
      }),
    ).toBe('cus_deleted');
  });

  it('returns undefined without a customer', () => {
    expect(getCustomerIdFromInvoice({ customer: null })).toBeUndefined();
  });
});
