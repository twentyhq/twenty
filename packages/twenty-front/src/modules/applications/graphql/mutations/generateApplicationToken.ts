import { gql } from '@apollo/client';

export const GENERATE_APPLICATION_TOKEN = gql`
  mutation GenerateApplicationToken($applicationId: UUID!) {
    generateApplicationToken(applicationId: $applicationId) {
      token
      expiresAt
    }
  }
`;
