import { gql } from '@apollo/client';

export const SKIP_SYNC_EMAIL = gql`
  mutation SkipSyncEmail {
    skipSyncEmail {
      success
    }
  }
`;
