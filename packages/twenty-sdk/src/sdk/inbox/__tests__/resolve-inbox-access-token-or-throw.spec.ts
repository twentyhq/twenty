import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveInboxAccessTokenOrThrow } from '@/sdk/inbox/resolve-inbox-access-token-or-throw';

const NOBODY_BEHIND_THE_RUN_ERROR =
  /Cron schedules, install hooks and unauthenticated webhooks/;

describe('resolveInboxAccessTokenOrThrow', () => {
  beforeEach(() => {
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', undefined);
    vi.stubEnv('TWENTY_APP_APPLICATION_ACCESS_TOKEN', undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('APPLICATION', () => {
    it('prefers the application token in a logic function', () => {
      vi.stubEnv('TWENTY_APP_APPLICATION_ACCESS_TOKEN', 'application-token');
      vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'member-token');

      expect(resolveInboxAccessTokenOrThrow('APPLICATION')).toBe(
        'application-token',
      );
    });

    it('falls back to the user-bound token of a front component', () => {
      vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'component-token');

      expect(resolveInboxAccessTokenOrThrow('APPLICATION')).toBe(
        'component-token',
      );
    });

    it('throws outside the app runtime', () => {
      expect(() => resolveInboxAccessTokenOrThrow('APPLICATION')).toThrow(
        /TWENTY_APP_APPLICATION_ACCESS_TOKEN or TWENTY_APP_ACCESS_TOKEN/,
      );
    });
  });

  describe('CURRENT_MEMBER', () => {
    it('uses the token of the member who triggered the run', () => {
      vi.stubEnv('TWENTY_APP_APPLICATION_ACCESS_TOKEN', 'application-token');
      vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'member-token');

      expect(resolveInboxAccessTokenOrThrow('CURRENT_MEMBER')).toBe(
        'member-token',
      );
    });

    it('uses the user-bound token of a front component', () => {
      vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'component-token');

      expect(resolveInboxAccessTokenOrThrow('CURRENT_MEMBER')).toBe(
        'component-token',
      );
    });

    it('refuses a run without a member token', () => {
      vi.stubEnv('TWENTY_APP_APPLICATION_ACCESS_TOKEN', 'application-token');

      expect(() => resolveInboxAccessTokenOrThrow('CURRENT_MEMBER')).toThrow(
        NOBODY_BEHIND_THE_RUN_ERROR,
      );
    });

    it('refuses a run nobody triggered, where both tokens are the application token', () => {
      vi.stubEnv('TWENTY_APP_APPLICATION_ACCESS_TOKEN', 'application-token');
      vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'application-token');

      expect(() => resolveInboxAccessTokenOrThrow('CURRENT_MEMBER')).toThrow(
        NOBODY_BEHIND_THE_RUN_ERROR,
      );
    });
  });
});
