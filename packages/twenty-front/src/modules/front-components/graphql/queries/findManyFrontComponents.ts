import gql from 'graphql-tag';

export const FIND_MANY_FRONT_COMPONENTS = gql`
  query FindManyFrontComponents {
    frontComponents {
      id
      name
      applicationId
      builtComponentChecksum
      builtComponentPath
      componentName
      createdAt
      description
      isHeadless
      sourceComponentPath
      universalIdentifier
      updatedAt
      usesSdkClient
    }
  }
`;
