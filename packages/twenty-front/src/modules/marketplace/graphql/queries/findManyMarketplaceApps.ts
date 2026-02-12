import gql from 'graphql-tag';

import { MARKETPLACE_APP_FRAGMENT } from '@/marketplace/graphql/fragments/marketplaceAppFragment';

export const FIND_MANY_MARKETPLACE_APPS = gql`
  ${MARKETPLACE_APP_FRAGMENT}
  query FindManyMarketplaceApps {
    findManyMarketplaceApps {
      ...MarketplaceAppFields
    }
  }
`;
