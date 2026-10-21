import { canReconnectApplicationConnection } from '@/settings/applications/utils/canReconnectApplicationConnection';

const AUTH_FAILED_AT = '2026-01-02T00:00:00.000Z';
const ARCHIVED_AT = '2026-01-03T00:00:00.000Z';

const CONFIGURED_PROVIDER = { oauth: { isClientCredentialsConfigured: true } };

describe('canReconnectApplicationConnection', () => {
  const authFailedConnection = {
    authFailedAt: AUTH_FAILED_AT,
    archivedAt: null,
  };

  it('allows reconnecting an auth-failed connection once OAuth is set up', () => {
    expect(
      canReconnectApplicationConnection({
        connection: authFailedConnection,
        provider: CONFIGURED_PROVIDER,
      }),
    ).toBe(true);
  });

  it.each([
    ['unknown provider', undefined],
    ['provider without OAuth', { oauth: null }],
    [
      'provider without client credentials',
      { oauth: { isClientCredentialsConfigured: false } },
    ],
  ])('refuses with %s', (_, provider) => {
    expect(
      canReconnectApplicationConnection({
        connection: authFailedConnection,
        provider,
      }),
    ).toBe(false);
  });

  it.each([
    ['healthy', { authFailedAt: null, archivedAt: null }],
    ['archived', { authFailedAt: null, archivedAt: ARCHIVED_AT }],
    [
      'archived and auth-failed',
      { authFailedAt: AUTH_FAILED_AT, archivedAt: ARCHIVED_AT },
    ],
  ])('refuses a %s connection even with OAuth set up', (_, connection) => {
    expect(
      canReconnectApplicationConnection({
        connection,
        provider: CONFIGURED_PROVIDER,
      }),
    ).toBe(false);
  });
});
