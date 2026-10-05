import { gql } from '@apollo/client';

import { RECORD_SHARING_FRAGMENT } from '@/object-record/record-sharing/graphql/fragments/recordSharingFragment';

export const GET_RECORD_SHARING = gql`
  ${RECORD_SHARING_FRAGMENT}
  query GetRecordSharing($target: RecordTargetInput!) {
    recordSharing(target: $target) {
      ...RecordSharingFields
    }
  }
`;
