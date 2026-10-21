import { canReconnectApplicationConnection } from '@/settings/applications/utils/canReconnectApplicationConnection';

const AUTH_FAILED_AT = '2026-01-02T00:00:00.000Z';
const ARCHIVED_AT = '2026-01-03T00:00:00.000Z';

describe('canReconnectApplicationConnection', () => {
  const authFailedConnection = {
    authFailedAt: AUTH_FAILED_AT,
    archivedAt: null,
  };

  it('allows reconnecting an auth-failed connection once OAuth is set up', () => {
    expect(
      canReconnectApplicationConnection({
        connection: authFailedConnection,
        isClientCredentialsConfigured: true,
      }),
    ).toBe(true);
  });

  it('refuses an auth-failed connection without OAuth client credentials', () => {
    expect(
      canReconnectApplicationConnection({
        connection: authFailedConnection,
        isClientCredentialsConfigured: false,
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
        isClientCredentialsConfigured: true,
      }),
    ).toBe(false);
  });
});
