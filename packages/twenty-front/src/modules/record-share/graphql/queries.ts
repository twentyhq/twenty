import { gql } from '@apollo/client';

import { RECORD_SHARES_FRAGMENT } from '@/record-share/graphql/fragment';

export const RECORD_SHARES = gql`
  ${RECORD_SHARES_FRAGMENT}
  query RecordShares($objectMetadataId: UUID!, $recordId: UUID!) {
    recordShares(objectMetadataId: $objectMetadataId, recordId: $recordId) {
      ...RecordSharesFields
    }
  }
`;
