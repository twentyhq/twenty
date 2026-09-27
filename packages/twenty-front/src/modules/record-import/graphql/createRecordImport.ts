import { gql } from '@apollo/client';

import { RECORD_IMPORT_FRAGMENT } from '@/record-import/graphql/recordImportFragment';

export const CREATE_RECORD_IMPORT = gql`
  ${RECORD_IMPORT_FRAGMENT}
  mutation CreateRecordImport($input: CreateRecordImportInput!) {
    createRecordImport(input: $input) {
      rows
      recordImport {
        ...RecordImportFields
      }
    }
  }
`;
