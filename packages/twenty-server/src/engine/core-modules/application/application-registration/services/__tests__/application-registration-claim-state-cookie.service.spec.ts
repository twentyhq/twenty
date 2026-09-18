import { type Request, type Response } from 'express';

import {
  APPLICATION_REGISTRATION_CLAIM_STATE_COOKIE_NAME,
  APPLICATION_REGISTRATION_CLAIM_STATE_SECURE_COOKIE_NAME,
} from 'src/engine/core-modules/application/application-registration/constants/application-registration-claim-state-cookie-name.constant';
import { ApplicationRegistrationClaimStateCookieService } from 'src/engine/core-modules/application/application-registration/services/application-registration-claim-state-cookie.service';

const buildService = ({
  serverUrl = 'https://app.twenty.test',
  sameSite = 'lax',
}: {
  serverUrl?: string;
  sameSite?: 'lax' | 'strict' | 'none';
} = {}) =>
  new ApplicationRegistrationClaimStateCookieService({
    get: jest.fn().mockImplementation(
      (key: string) =>
        ({
          SERVER_URL: serverUrl,
          AUTH_COOKIE_SAME_SITE: sameSite,
        })[key],
    ),
  } as never);

const attachNonce = (
  service: ApplicationRegistrationClaimStateCookieService,
) => {
  const cookie = jest.fn();

  service.attachNonceToResponse(
    { cookie } as unknown as Response,
    'nonce',
    1000,
  );

  return cookie.mock.calls[0];
};

describe('ApplicationRegistrationClaimStateCookieService', () => {
  it('never issues the nonce cookie as SameSite=strict, which a browser would withhold on the redirect back from GitHub', () => {
    const [, , options] = attachNonce(buildService({ sameSite: 'strict' }));

    expect(options.sameSite).toBe('lax');
  });

  it('keeps SameSite=none for split-origin deployments', () => {
    const [, , options] = attachNonce(buildService({ sameSite: 'none' }));

    expect(options.sameSite).toBe('none');
    expect(options.secure).toBe(true);
  });

  it('issues an httpOnly secure cookie under the __Host- name on https', () => {
    const [name, value, options] = attachNonce(buildService());

    expect(name).toBe(APPLICATION_REGISTRATION_CLAIM_STATE_SECURE_COOKIE_NAME);
    expect(value).toBe('nonce');
    expect(options).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000,
    });
  });

  it('falls back to the plain cookie name on a cleartext deployment', () => {
    const [name, , options] = attachNonce(
      buildService({ serverUrl: 'http://localhost:3000' }),
    );

    expect(name).toBe(APPLICATION_REGISTRATION_CLAIM_STATE_COOKIE_NAME);
    expect(options.secure).toBe(false);
  });

  it('reads the nonce back from the cookie header', () => {
    const service = buildService();

    expect(
      service.extractNonceFromRequest({
        headers: {
          cookie: `other=x; ${APPLICATION_REGISTRATION_CLAIM_STATE_SECURE_COOKIE_NAME}=abc123`,
        },
      } as Request),
    ).toBe('abc123');
  });

  it('ignores the plain cookie name on an https deployment', () => {
    const service = buildService();

    expect(
      service.extractNonceFromRequest({
        headers: {
          cookie: `${APPLICATION_REGISTRATION_CLAIM_STATE_COOKIE_NAME}=planted`,
        },
      } as Request),
    ).toBeUndefined();
  });
});
