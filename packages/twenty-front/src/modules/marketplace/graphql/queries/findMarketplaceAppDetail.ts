import gql from 'graphql-tag';

import { MARKETPLACE_APP_DETAIL_FRAGMENT } from '@/marketplace/graphql/fragments/marketplaceAppDetailFragment';

export const FIND_MARKETPLACE_APP_DETAIL = gql`
  ${MARKETPLACE_APP_DETAIL_FRAGMENT}
  query FindMarketplaceAppDetail($universalIdentifier: String!) {
    findMarketplaceAppDetail(universalIdentifier: $universalIdentifier) {
      ...MarketplaceAppDetailFields
    }
  }
`;
