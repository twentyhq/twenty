import gql from 'graphql-tag';

export const MARKETPLACE_APP_FRAGMENT = gql`
  fragment MarketplaceAppFields on MarketplaceApp {
    id
    name
    description
    icon
    author
    category
    logo
    sourcePackage
    isFeatured
  }
`;
