import { type MyConsolidatedConnectedAccountsQuery } from '~/generated-metadata/graphql';

export type ConsolidatedConnectedAccount =
  MyConsolidatedConnectedAccountsQuery['myConnectedAccounts'][number];
