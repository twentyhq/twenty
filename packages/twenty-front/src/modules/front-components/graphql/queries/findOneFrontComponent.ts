import gql from 'graphql-tag';

export const FIND_ONE_FRONT_COMPONENT = gql`
  query FindOneFrontComponent($id: UUID!) {
    frontComponent(id: $id) {
      id
      name
      applicationId
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
    }
  }
`;
