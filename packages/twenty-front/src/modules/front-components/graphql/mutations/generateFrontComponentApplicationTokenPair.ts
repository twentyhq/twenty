import gql from 'graphql-tag';

export const GENERATE_FRONT_COMPONENT_APPLICATION_TOKEN_PAIR = gql`
  mutation GenerateFrontComponentApplicationTokenPair($applicationId: UUID!) {
    generateFrontComponentApplicationTokenPair(applicationId: $applicationId) {
      applicationAccessToken {
        token
        expiresAt
      }
      applicationRefreshToken {
        token
        expiresAt
      }
    }
  }
`;
