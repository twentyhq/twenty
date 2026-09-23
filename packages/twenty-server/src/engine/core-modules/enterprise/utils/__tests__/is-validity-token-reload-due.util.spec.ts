/* @license Enterprise */

import { ENTERPRISE_VALIDITY_TOKEN_RELOAD_INTERVAL_MS } from 'src/engine/core-modules/enterprise/constants/enterprise-validity-token-reload-interval.constant';
import { ENTERPRISE_VALIDITY_TOKEN_RELOAD_RETRY_INTERVAL_MS } from 'src/engine/core-modules/enterprise/constants/enterprise-validity-token-reload-retry-interval.constant';
import { isValidityTokenReloadDue } from 'src/engine/core-modules/enterprise/utils/is-validity-token-reload-due.util';

describe('isValidityTokenReloadDue', () => {
  const NOW = 1_700_000_000_000;

  it('is due before anything has been read', () => {
    expect(
      isValidityTokenReloadDue({
        lastLoadStartedAt: null,
        didLastLoadFail: false,
        now: NOW,
      }),
    ).toBe(true);
  });

  it('is not due while the token in hand is younger than the interval', () => {
    expect(
      isValidityTokenReloadDue({
        lastLoadStartedAt:
          NOW - ENTERPRISE_VALIDITY_TOKEN_RELOAD_INTERVAL_MS + 1,
        didLastLoadFail: false,
        now: NOW,
      }),
    ).toBe(false);
  });

  // The worker renews the token in the database, so a server process that never
  // re-read it would serve its boot-time copy until that copy expired.
  it('is due once the interval has elapsed', () => {
    expect(
      isValidityTokenReloadDue({
        lastLoadStartedAt: NOW - ENTERPRISE_VALIDITY_TOKEN_RELOAD_INTERVAL_MS,
        didLastLoadFail: false,
        now: NOW,
      }),
    ).toBe(true);
  });

  it('is due on the retry interval after a read that failed', () => {
    expect(
      isValidityTokenReloadDue({
        lastLoadStartedAt:
          NOW - ENTERPRISE_VALIDITY_TOKEN_RELOAD_RETRY_INTERVAL_MS,
        didLastLoadFail: true,
        now: NOW,
      }),
    ).toBe(true);
  });

  it('is not due right after a read that failed', () => {
    expect(
      isValidityTokenReloadDue({
        lastLoadStartedAt:
          NOW - ENTERPRISE_VALIDITY_TOKEN_RELOAD_RETRY_INTERVAL_MS + 1,
        didLastLoadFail: true,
        now: NOW,
      }),
    ).toBe(false);
  });
});
