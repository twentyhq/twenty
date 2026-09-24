import { buildPaymentFrameAncestors } from 'src/engine/core-modules/frontend/utils/build-payment-frame-ancestors.util';

describe('buildPaymentFrameAncestors', () => {
  it('allows every workspace subdomain of the front domain', () => {
    expect(
      buildPaymentFrameAncestors({
        requestBaseUrl: 'https://app.twenty.com',
        clientConfig: {
          frontDomain: 'twenty.com',
          isMultiWorkspaceEnabled: true,
        },
      }),
    ).toBe("'self' https://*.twenty.com");
  });

  it('keeps the port of local setups', () => {
    expect(
      buildPaymentFrameAncestors({
        requestBaseUrl: 'http://app.localhost:3001',
        clientConfig: {
          frontDomain: 'localhost',
          isMultiWorkspaceEnabled: true,
        },
      }),
    ).toBe("'self' http://*.localhost:3001");
  });

  it('only allows the same origin on a single workspace server', () => {
    expect(
      buildPaymentFrameAncestors({
        requestBaseUrl: 'https://crm.acme.com',
        clientConfig: {
          frontDomain: 'crm.acme.com',
          isMultiWorkspaceEnabled: false,
        },
      }),
    ).toBe("'self'");
  });
});
