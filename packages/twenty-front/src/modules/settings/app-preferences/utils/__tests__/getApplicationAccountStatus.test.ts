import { getApplicationAccountStatus } from '@/settings/app-preferences/utils/getApplicationAccountStatus';

describe('getApplicationAccountStatus', () => {
  it('should be connected when the credential is live', () => {
    expect(
      getApplicationAccountStatus({ archivedAt: null, authFailedAt: null }),
    ).toBe('CONNECTED');
  });

  it('should need a reconnect when the credential failed', () => {
    expect(
      getApplicationAccountStatus({
        archivedAt: null,
        authFailedAt: '2026-10-06T10:00:00.000Z',
      }),
    ).toBe('RECONNECT_NEEDED');
  });

  it('should be disconnected when archived, even without an auth failure', () => {
    expect(
      getApplicationAccountStatus({
        archivedAt: '2026-10-06T10:00:00.000Z',
        authFailedAt: null,
      }),
    ).toBe('DISCONNECTED');
  });
});
