import { gql } from '@apollo/client';

import { RECORD_IMPORT_FRAGMENT } from '@/record-import/graphql/recordImportFragment';

export const RECORD_IMPORT_PROGRESS = gql`
  ${RECORD_IMPORT_FRAGMENT}
  subscription RecordImportProgress($input: RecordImportSessionInput!) {
    recordImportProgress(input: $input) {
      ...RecordImportFields
    }
  }
`;
