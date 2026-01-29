import gql from 'graphql-tag';

export const FIND_MANY_MARKETPLACE_APPS = gql`
  query FindManyMarketplaceApps {
    findManyMarketplaceApps {
      id
      name
      description
      icon
      version
      author
      category
      logo
      screenshots
      aboutDescription
      providers
      websiteUrl
      termsUrl
    }
  }
`;
