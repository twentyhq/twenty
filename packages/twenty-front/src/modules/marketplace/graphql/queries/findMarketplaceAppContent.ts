import gql from 'graphql-tag';

import { APPLICATION_CONTENT_FRAGMENT } from '@/applications/graphql/fragments/applicationContentFragment';

export const FIND_MARKETPLACE_APP_CONTENT = gql`
  ${APPLICATION_CONTENT_FRAGMENT}
  query FindMarketplaceAppContent($universalIdentifier: String!) {
    findMarketplaceAppDetail(universalIdentifier: $universalIdentifier) {
      id
      universalIdentifier
      name
      logoUrl
      content {
        ...ApplicationContentFields
      }
    }
  }
`;
