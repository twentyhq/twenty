import { gql } from '@apollo/client';

export const GENERATE_PLAYGROUND_TOKEN = gql`
  mutation GeneratePlaygroundToken {
    generatePlaygroundToken {
      token
      expiresAt
    }
  }
`;
