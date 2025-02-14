import { gql } from '@apollo/client';

export const SERVERLESS_FUNCTION_FRAGMENT = gql`
  fragment ServerlessFunctionFields on ServerlessFunction {
    id
    name
    description
    runtime
    timeoutSeconds
    syncStatus
    latestVersion
    latestVersionInputSchema
    publishedVersions
    createdAt
    updatedAt
  }
`;
