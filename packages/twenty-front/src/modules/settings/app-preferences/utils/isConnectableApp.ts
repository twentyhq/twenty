import { isNonEmptyString } from '@sniptt/guards';
import { type MarketplaceApp } from '~/generated-metadata/graphql';

export const isConnectableApp = <
  TMarketplaceApp extends Pick<MarketplaceApp, 'connectUrl'>,
>(
  marketplaceApp: TMarketplaceApp,
): marketplaceApp is TMarketplaceApp & { connectUrl: string } =>
  isNonEmptyString(marketplaceApp.connectUrl);
