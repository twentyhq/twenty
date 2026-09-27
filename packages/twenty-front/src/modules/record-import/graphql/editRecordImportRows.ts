import { gql } from '@apollo/client';

import { RECORD_IMPORT_FRAGMENT } from '@/record-import/graphql/recordImportFragment';

export const EDIT_RECORD_IMPORT_ROWS = gql`
  ${RECORD_IMPORT_FRAGMENT}
  mutation EditRecordImportRows($input: EditRecordImportRowsInput!) {
    editRecordImportRows(input: $input) {
      ...RecordImportFields
    }
  }
`;
