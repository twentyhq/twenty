import { gql } from '@apollo/client';

import { RECORD_SHARING_FRAGMENT } from '@/object-record/record-sharing/graphql/fragments/recordSharingFragment';

export const SET_RECORD_SHARE = gql`
  ${RECORD_SHARING_FRAGMENT}
  mutation SetRecordShare(
    $target: RecordTargetInput!
    $principal: RecordSharePrincipalInput!
    $accessLevel: RecordShareAccessLevel!
  ) {
    setRecordShare(
      target: $target
      principal: $principal
      accessLevel: $accessLevel
    ) {
      ...RecordSharingFields
    }
  }
`;
