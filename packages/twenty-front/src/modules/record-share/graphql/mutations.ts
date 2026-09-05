import { gql } from '@apollo/client';

import { RECORD_SHARES_FRAGMENT } from '@/record-share/graphql/fragment';

export const SHARE_RECORD = gql`
  ${RECORD_SHARES_FRAGMENT}
  mutation ShareRecord(
    $objectMetadataId: UUID!
    $recordId: UUID!
    $shareWith: [ShareWithInput!]!
  ) {
    shareRecord(
      objectMetadataId: $objectMetadataId
      recordId: $recordId
      shareWith: $shareWith
    ) {
      ...RecordSharesFields
    }
  }
`;

export const UNSHARE_RECORD = gql`
  ${RECORD_SHARES_FRAGMENT}
  mutation UnshareRecord(
    $objectMetadataId: UUID!
    $recordId: UUID!
    $principalId: UUID!
  ) {
    unshareRecord(
      objectMetadataId: $objectMetadataId
      recordId: $recordId
      principalId: $principalId
    ) {
      ...RecordSharesFields
    }
  }
`;
