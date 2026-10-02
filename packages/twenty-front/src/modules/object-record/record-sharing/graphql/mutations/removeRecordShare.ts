import { gql } from '@apollo/client';

import { RECORD_SHARING_FRAGMENT } from '@/object-record/record-sharing/graphql/fragments/recordSharingFragment';

export const REMOVE_RECORD_SHARE = gql`
  ${RECORD_SHARING_FRAGMENT}
  mutation RemoveRecordShare(
    $target: RecordTargetInput!
    $principal: RecordSharePrincipalInput!
  ) {
    removeRecordShare(target: $target, principal: $principal) {
      ...RecordSharingFields
    }
  }
`;
