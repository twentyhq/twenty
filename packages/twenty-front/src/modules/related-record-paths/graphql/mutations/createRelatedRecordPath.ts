import gql from 'graphql-tag';

import { RELATED_RECORD_PATH_FRAGMENT } from '@/related-record-paths/graphql/fragments/relatedRecordPathFragment';

export const CREATE_RELATED_RECORD_PATH = gql`
  mutation CreateRelatedRecordPath($input: CreateRelatedRecordPathInput!) {
    createRelatedRecordPath(input: $input) {
      ...RelatedRecordPathFragment
    }
  }
  ${RELATED_RECORD_PATH_FRAGMENT}
`;
