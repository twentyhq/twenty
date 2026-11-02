import { type MarketplaceApp } from '~/generated-metadata/graphql';

export type ConnectableApp = Pick<
  MarketplaceApp,
  'id' | 'name' | 'description' | 'logoUrl'
> & {
  connectUrl: string;
};
