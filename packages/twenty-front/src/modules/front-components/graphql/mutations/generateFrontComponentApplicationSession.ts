import gql from 'graphql-tag';

export const GENERATE_FRONT_COMPONENT_APPLICATION_SESSION = gql`
  mutation GenerateFrontComponentApplicationSession($applicationId: UUID!) {
    generateFrontComponentApplicationSession(applicationId: $applicationId) {
      applicationTokenPair {
        applicationAccessToken {
          token
          expiresAt
        }
        applicationRefreshToken {
          token
          expiresAt
        }
      }
      applicationVariables
    }
  }
`;
