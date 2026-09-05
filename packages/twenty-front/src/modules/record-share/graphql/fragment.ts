import { gql } from '@apollo/client';

export const RECORD_SHARES_FRAGMENT = gql`
  fragment RecordSharesFields on RecordShares {
    viewerAccessLevel
    shares {
      id
      principalId
      principalType
      accessLevel
      rowCause
      sourceId
    }
  }
`;
