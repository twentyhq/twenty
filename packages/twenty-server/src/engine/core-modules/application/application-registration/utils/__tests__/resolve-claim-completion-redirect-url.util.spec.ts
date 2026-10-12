import { resolveClaimCompletionRedirectUrl } from 'src/engine/core-modules/application/application-registration/utils/resolve-claim-completion-redirect-url.util';

describe('resolveClaimCompletionRedirectUrl', () => {
  const baseParams = {
    requestOrigin: 'https://api.twenty.com',
    allowedOrigins: [
      'https://api.twenty.com',
      'https://acme.twenty.com/',
      'https://crm.acme.com/',
    ],
    code: 'github-code',
    state: 'signed-state',
  };

  it('hands over to the workspace host that holds the nonce cookie', () => {
    expect(
      resolveClaimCompletionRedirectUrl({
        ...baseParams,
        cookieOrigin: 'https://acme.twenty.com',
      }),
    ).toBe(
      'https://acme.twenty.com/application-registration-claim/github/complete?code=github-code&state=signed-state',
    );
  });

  it('hands over to the custom domain when the mint came from it', () => {
    expect(
      resolveClaimCompletionRedirectUrl({
        ...baseParams,
        cookieOrigin: 'https://crm.acme.com',
      }),
    ).toBe(
      'https://crm.acme.com/application-registration-claim/github/complete?code=github-code&state=signed-state',
    );
  });

  it('stays put when the cookie was issued by the host receiving the callback', () => {
    expect(
      resolveClaimCompletionRedirectUrl({
        ...baseParams,
        cookieOrigin: 'https://API.twenty.com:443',
      }),
    ).toBeUndefined();
  });

  it('refuses an origin the instance does not own', () => {
    expect(
      resolveClaimCompletionRedirectUrl({
        ...baseParams,
        cookieOrigin: 'https://evil.example',
      }),
    ).toBeUndefined();
  });

  it.each([undefined, '', 'not a url'])(
    'stays put when the state carries no usable cookie origin (%p)',
    (cookieOrigin) => {
      expect(
        resolveClaimCompletionRedirectUrl({ ...baseParams, cookieOrigin }),
      ).toBeUndefined();
    },
  );
});
