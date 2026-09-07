import { isActiveAppConnectedAccount } from '~/pages/settings/applications/utils/isActiveAppConnectedAccount';

describe('isActiveAppConnectedAccount', () => {
  it('keeps a live app connection', () => {
    expect(
      isActiveAppConnectedAccount({ provider: 'app', archivedAt: null }),
    ).toBe(true);
  });

  it('drops an archived app connection', () => {
    expect(
      isActiveAppConnectedAccount({
        provider: 'app',
        archivedAt: '2026-06-01T00:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('drops email and calendar accounts', () => {
    expect(
      isActiveAppConnectedAccount({ provider: 'google', archivedAt: null }),
    ).toBe(false);
  });
});
