import { gql } from '@apollo/client';

import { RECORD_SHARING_FRAGMENT } from '@/object-record/record-sharing/graphql/fragments/recordSharingFragment';

export const SET_RECORD_PRIVATE = gql`
  ${RECORD_SHARING_FRAGMENT}
  mutation SetRecordPrivate($target: RecordTargetInput!, $isPrivate: Boolean!) {
    setRecordPrivate(target: $target, isPrivate: $isPrivate) {
      ...RecordSharingFields
    }
  }
`;
