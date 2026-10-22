import { getAppOnlyApplicationIds } from '@/settings/app-preferences/utils/getAppOnlyApplicationIds';

const APPLICATION_IDS_WITH_CONNECTIONS_TAB = new Set(['linear']);

describe('getAppOnlyApplicationIds', () => {
  it('returns no application for a group with a built-in account', () => {
    expect(
      getAppOnlyApplicationIds({
        group: {
          builtInAccount: { applicationId: null },
          appAccounts: [{ applicationId: 'linear' }],
        },
        applicationIdsWithConnectionsTab: APPLICATION_IDS_WITH_CONNECTIONS_TAB,
      }),
    ).toEqual({
      appOnlyConnectionsApplicationId: undefined,
      appOnlyApplicationId: undefined,
    });
  });

  it('prefers an application that has a connections tab', () => {
    expect(
      getAppOnlyApplicationIds({
        group: {
          appAccounts: [
            { applicationId: 'fathom' },
            { applicationId: 'linear' },
          ],
        },
        applicationIdsWithConnectionsTab: APPLICATION_IDS_WITH_CONNECTIONS_TAB,
      }),
    ).toEqual({
      appOnlyConnectionsApplicationId: 'linear',
      appOnlyApplicationId: 'linear',
    });
  });

  it('falls back to the first application without a connections tab', () => {
    expect(
      getAppOnlyApplicationIds({
        group: {
          appAccounts: [{ applicationId: 'fathom' }, { applicationId: null }],
        },
        applicationIdsWithConnectionsTab: APPLICATION_IDS_WITH_CONNECTIONS_TAB,
      }),
    ).toEqual({
      appOnlyConnectionsApplicationId: undefined,
      appOnlyApplicationId: 'fathom',
    });
  });
});
