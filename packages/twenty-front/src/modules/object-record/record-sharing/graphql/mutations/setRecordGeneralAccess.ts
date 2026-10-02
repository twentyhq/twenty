import { gql } from '@apollo/client';

import { RECORD_SHARING_FRAGMENT } from '@/object-record/record-sharing/graphql/fragments/recordSharingFragment';

export const SET_RECORD_GENERAL_ACCESS = gql`
  ${RECORD_SHARING_FRAGMENT}
  mutation SetRecordGeneralAccess(
    $target: RecordTargetInput!
    $accessLevel: RecordShareAccessLevel!
  ) {
    setRecordGeneralAccess(target: $target, accessLevel: $accessLevel) {
      ...RecordSharingFields
    }
  }
`;
