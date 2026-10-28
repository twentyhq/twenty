import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveInboxAccessToken } from '@/sdk/inbox/resolve-inbox-access-token';

const NOBODY_BEHIND_THE_RUN_ERROR =
  /Cron schedules, install hooks and unauthenticated webhooks/;

describe('resolveInboxAccessToken', () => {
  const initialEnvironment = process.env;

  beforeEach(() => {
    process.env = { ...initialEnvironment };
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    delete process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN;
  });

  afterEach(() => {
    process.env = initialEnvironment;
  });

  describe('APPLICATION', () => {
    it('prefers the application token in a logic function', () => {
      process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'application-token';
      process.env.TWENTY_APP_ACCESS_TOKEN = 'member-token';

      expect(resolveInboxAccessToken('APPLICATION')).toBe('application-token');
    });

    it('falls back to the user-bound token of a front component', () => {
      process.env.TWENTY_APP_ACCESS_TOKEN = 'component-token';

      expect(resolveInboxAccessToken('APPLICATION')).toBe('component-token');
    });

    it('throws outside the app runtime', () => {
      expect(() => resolveInboxAccessToken('APPLICATION')).toThrow(
        /TWENTY_APP_APPLICATION_ACCESS_TOKEN or TWENTY_APP_ACCESS_TOKEN/,
      );
    });
  });

  describe('CURRENT_MEMBER', () => {
    it('uses the token of the member who triggered the run', () => {
      process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'application-token';
      process.env.TWENTY_APP_ACCESS_TOKEN = 'member-token';

      expect(resolveInboxAccessToken('CURRENT_MEMBER')).toBe('member-token');
    });

    it('uses the user-bound token of a front component', () => {
      process.env.TWENTY_APP_ACCESS_TOKEN = 'component-token';

      expect(resolveInboxAccessToken('CURRENT_MEMBER')).toBe('component-token');
    });

    it('refuses a run without a member token', () => {
      process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'application-token';

      expect(() => resolveInboxAccessToken('CURRENT_MEMBER')).toThrow(
        NOBODY_BEHIND_THE_RUN_ERROR,
      );
    });

    it('refuses a run nobody triggered, where both tokens are the application token', () => {
      process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'application-token';
      process.env.TWENTY_APP_ACCESS_TOKEN = 'application-token';

      expect(() => resolveInboxAccessToken('CURRENT_MEMBER')).toThrow(
        NOBODY_BEHIND_THE_RUN_ERROR,
      );
    });
  });
});
