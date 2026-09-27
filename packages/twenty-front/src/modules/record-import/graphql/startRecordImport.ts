import { gql } from '@apollo/client';

import { RECORD_IMPORT_FRAGMENT } from '@/record-import/graphql/recordImportFragment';

export const START_RECORD_IMPORT = gql`
  ${RECORD_IMPORT_FRAGMENT}
  mutation StartRecordImport($input: RecordImportVersionedInput!) {
    startRecordImport(input: $input) {
      ...RecordImportFields
    }
  }
`;
