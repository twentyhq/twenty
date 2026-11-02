import gql from 'graphql-tag';

import { RELATED_RECORD_PATH_FRAGMENT } from '@/related-record-paths/graphql/fragments/relatedRecordPathFragment';

export const FIND_MANY_RELATED_RECORD_PATHS = gql`
  query FindManyRelatedRecordPaths {
    relatedRecordPaths {
      ...RelatedRecordPathFragment
    }
  }
  ${RELATED_RECORD_PATH_FRAGMENT}
`;
