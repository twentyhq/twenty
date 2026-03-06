import gql from 'graphql-tag';

import { MARKETPLACE_APP_FRAGMENT } from '@/marketplace/graphql/fragments/marketplaceAppFragment';

export const FIND_ONE_MARKETPLACE_APP = gql`
  ${MARKETPLACE_APP_FRAGMENT}
  query FindOneMarketplaceApp($universalIdentifier: String!) {
    findOneMarketplaceApp(universalIdentifier: $universalIdentifier) {
      ...MarketplaceAppFields
    }
  }
`;
