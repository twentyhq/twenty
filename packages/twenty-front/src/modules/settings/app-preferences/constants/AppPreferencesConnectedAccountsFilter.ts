import { type MyConnectedAccountsFilterInput } from '~/generated-metadata/graphql';

// Workspace-shared app connections are workspace setup, managed from the
// workspace Apps settings, not a personal preference
export const APP_PREFERENCES_CONNECTED_ACCOUNTS_FILTER: MyConnectedAccountsFilterInput =
  {
    ownedByCaller: true,
    appConnectionVisibility: 'user',
  };
