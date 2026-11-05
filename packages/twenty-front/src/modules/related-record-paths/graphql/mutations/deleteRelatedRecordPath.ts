import gql from 'graphql-tag';

import { RELATED_RECORD_PATH_FRAGMENT } from '@/related-record-paths/graphql/fragments/relatedRecordPathFragment';

export const DELETE_RELATED_RECORD_PATH = gql`
  mutation DeleteRelatedRecordPath($id: UUID!) {
    deleteRelatedRecordPath(id: $id) {
      ...RelatedRecordPathFragment
    }
  }
  ${RELATED_RECORD_PATH_FRAGMENT}
`;
