import { type MyConnectedAccountsFilterInput } from '~/generated-metadata/graphql';

// Workspace-shared app connections are workspace setup, not a personal preference
export const APP_PREFERENCES_CONNECTED_ACCOUNTS_FILTER: MyConnectedAccountsFilterInput =
  {
    ownedByCaller: true,
    appConnectionVisibility: 'user',
  };
