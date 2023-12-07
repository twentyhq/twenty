import { gql } from '@apollo/client';

export const GENERATE_ONE_SHORT_TERM_TOKEN = gql`
  mutation generateShortTermToken {
    generateShortTermToken {
      shortTermToken {
        token
      }
    }
  }
`;
