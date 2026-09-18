import { type Request, type Response } from 'express';

import {
  getApplicationRegistrationClaimStateCookieName,
  getApplicationRegistrationClaimStateSecureCookieName,
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

const REGISTRATION_ID = '33333333-3333-4333-8333-333333333333';
const OTHER_REGISTRATION_ID = '44444444-4444-4444-8444-444444444444';

const attachNonce = (
  service: ApplicationRegistrationClaimStateCookieService,
  applicationRegistrationId = REGISTRATION_ID,
) => {
  const cookie = jest.fn();

  service.attachNonceToResponse({
    response: { cookie } as unknown as Response,
    applicationRegistrationId,
    nonce: 'nonce',
    maxAgeMs: 1000,
  });

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

    expect(name).toBe(
      getApplicationRegistrationClaimStateSecureCookieName(REGISTRATION_ID),
    );
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

    expect(name).toBe(
      getApplicationRegistrationClaimStateCookieName(REGISTRATION_ID),
    );
    expect(options.secure).toBe(false);
  });

  it('keeps concurrent claims on separate cookies', () => {
    const service = buildService();

    const [firstName] = attachNonce(service, REGISTRATION_ID);
    const [secondName] = attachNonce(service, OTHER_REGISTRATION_ID);

    expect(firstName).not.toBe(secondName);

    expect(
      service.extractNonceFromRequest(
        {
          headers: {
            cookie: `${firstName}=first; ${secondName}=second`,
          },
        } as Request,
        OTHER_REGISTRATION_ID,
      ),
    ).toBe('second');
  });

  it('reads the nonce back from the cookie header', () => {
    const service = buildService();

    expect(
      service.extractNonceFromRequest(
        {
          headers: {
            cookie: `other=x; ${getApplicationRegistrationClaimStateSecureCookieName(REGISTRATION_ID)}=abc123`,
          },
        } as Request,
        REGISTRATION_ID,
      ),
    ).toBe('abc123');
  });

  it('ignores the plain cookie name on an https deployment', () => {
    const service = buildService();

    expect(
      service.extractNonceFromRequest(
        {
          headers: {
            cookie: `${getApplicationRegistrationClaimStateCookieName(REGISTRATION_ID)}=planted`,
          },
        } as Request,
        REGISTRATION_ID,
      ),
    ).toBeUndefined();
  });
});
