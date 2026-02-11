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
      objects {
        universalIdentifier
        nameSingular
        namePlural
        labelSingular
        labelPlural
        description
        icon
        fields {
          name
          type
          label
          description
          icon
        }
      }
      fields {
        name
        type
        label
        description
        icon
        objectUniversalIdentifier
      }
      logicFunctions {
        name
        description
        timeoutSeconds
      }
      frontComponents {
        name
        description
      }
    }
  }
`;
