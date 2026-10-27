import { canReconnectApplicationConnection } from '@/settings/applications/utils/canReconnectApplicationConnection';

const AUTH_FAILED_AT = '2026-01-02T00:00:00.000Z';
const ARCHIVED_AT = '2026-01-03T00:00:00.000Z';

describe('canReconnectApplicationConnection', () => {
  const authFailedConnection = {
    authFailedAt: AUTH_FAILED_AT,
    archivedAt: null,
  };

  it('allows reconnecting an auth-failed connection once authorization can start', () => {
    expect(
      canReconnectApplicationConnection({
        connection: authFailedConnection,
        canStartAuthorization: true,
      }),
    ).toBe(true);
  });

  it('refuses an auth-failed connection when authorization cannot start', () => {
    expect(
      canReconnectApplicationConnection({
        connection: authFailedConnection,
        canStartAuthorization: false,
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
  ])(
    'refuses a %s connection even when authorization can start',
    (_, connection) => {
      expect(
        canReconnectApplicationConnection({
          connection,
          canStartAuthorization: true,
        }),
      ).toBe(false);
    },
  );
});
