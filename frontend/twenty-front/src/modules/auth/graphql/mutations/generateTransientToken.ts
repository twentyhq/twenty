import { gql } from '@apollo/client';

export const GENERATE_ONE_TRANSIENT_TOKEN = gql`
  mutation generateTransientToken {
    generateTransientToken {
      transientToken {
        token
      }
    }
  }
`;
