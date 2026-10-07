import { type MyAppPreferencesConnectedAccountsQuery } from '~/generated-metadata/graphql';

export type AppPreferencesConnectedAccount =
  MyAppPreferencesConnectedAccountsQuery['myConnectedAccounts'][number];
