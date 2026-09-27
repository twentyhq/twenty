import { gql } from '@apollo/client';

import { RECORD_IMPORT_FRAGMENT } from '@/record-import/graphql/recordImportFragment';

export const PREPARE_RECORD_IMPORT = gql`
  ${RECORD_IMPORT_FRAGMENT}
  mutation PrepareRecordImport($input: PrepareRecordImportInput!) {
    prepareRecordImport(input: $input) {
      ...RecordImportFields
    }
  }
`;
