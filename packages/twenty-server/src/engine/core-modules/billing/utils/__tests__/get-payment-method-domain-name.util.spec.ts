/* @license Enterprise */

import { getPaymentMethodDomainName } from 'src/engine/core-modules/billing/utils/get-payment-method-domain-name.util';

describe('getPaymentMethodDomainName', () => {
  it('returns the hostname of an HTTPS workspace URL', () => {
    expect(getPaymentMethodDomainName('https://acme.twenty.com/')).toBe(
      'acme.twenty.com',
    );
  });

  it('drops the port', () => {
    expect(getPaymentMethodDomainName('https://acme.twenty.com:8443/')).toBe(
      'acme.twenty.com',
    );
  });

  it('returns null for a workspace not served over HTTPS', () => {
    expect(
      getPaymentMethodDomainName('http://acme.localhost:3001/'),
    ).toBeNull();
  });
});
