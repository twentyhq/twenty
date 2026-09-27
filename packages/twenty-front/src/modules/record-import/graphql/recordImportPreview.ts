import { gql } from '@apollo/client';

import { RECORD_IMPORT_FRAGMENT } from '@/record-import/graphql/recordImportFragment';

export const RECORD_IMPORT_PREVIEW = gql`
  ${RECORD_IMPORT_FRAGMENT}
  query RecordImportPreview($input: PreviewRecordImportSheetInput!) {
    recordImportPreview(input: $input) {
      rows
      recordImport {
        ...RecordImportFields
      }
    }
  }
`;
