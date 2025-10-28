import { gql } from '@apollo/client';

export const SERVERLESS_FUNCTION_FRAGMENT = gql`
  fragment ServerlessFunctionFields on ServerlessFunction {
    id
    name
    description
    runtime
    timeoutSeconds
    latestVersion
    publishedVersions
    cronTriggers {
      id
      settings
      createdAt
      updatedAt
    }
    databaseEventTriggers {
      id
      settings
      createdAt
      updatedAt
    }
    routeTriggers {
      id
      path
      isAuthRequired
      httpMethod
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
`;
