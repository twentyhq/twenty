import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';

const AUTH_FAILED_AT = '2026-01-02T00:00:00.000Z';
const ARCHIVED_AT = '2026-01-03T00:00:00.000Z';

describe('isApplicationConnectionReconnectNeeded', () => {
  it.each([
    ['healthy', false, { authFailedAt: null, archivedAt: null }],
    ['auth-failed', true, { authFailedAt: AUTH_FAILED_AT, archivedAt: null }],
    ['archived', false, { authFailedAt: null, archivedAt: ARCHIVED_AT }],
    [
      'archived and auth-failed',
      false,
      { authFailedAt: AUTH_FAILED_AT, archivedAt: ARCHIVED_AT },
    ],
  ])('%s connection needs reconnect: %s', (_, expected, connection) => {
    expect(isApplicationConnectionReconnectNeeded(connection)).toBe(expected);
  });
});
