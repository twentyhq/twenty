import { buildPaymentFrameUrl } from '@/settings/billing/payment-frame/utils/buildPaymentFrameUrl';

describe('buildPaymentFrameUrl', () => {
  it('loads the payment form from the default domain on a workspace subdomain', () => {
    expect(
      buildPaymentFrameUrl({
        currentUrl: 'https://acme.twenty.com/settings/billing?tab=plans',
        frontDomain: 'twenty.com',
        defaultDomain: 'app.twenty.com',
      }),
    ).toBe('https://app.twenty.com/payment-frame.html');
  });

  it('keeps the protocol and port of local setups', () => {
    expect(
      buildPaymentFrameUrl({
        currentUrl: 'http://apple.localhost:3001/plan-required',
        frontDomain: 'localhost',
        defaultDomain: 'app.localhost',
      }),
    ).toBe('http://app.localhost:3001/payment-frame.html');
  });

  it('keeps the payment form on a custom domain', () => {
    expect(
      buildPaymentFrameUrl({
        currentUrl: 'https://crm.acme.com/settings/billing',
        frontDomain: 'twenty.com',
        defaultDomain: 'app.twenty.com',
      }),
    ).toBe('https://crm.acme.com/payment-frame.html');
  });

  it('keeps the payment form on a single workspace server', () => {
    expect(
      buildPaymentFrameUrl({
        currentUrl: 'https://crm.acme.com/settings/billing',
        frontDomain: 'crm.acme.com',
        defaultDomain: 'crm.acme.com',
      }),
    ).toBe('https://crm.acme.com/payment-frame.html');
  });
});
