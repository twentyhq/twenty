import { gql } from '@apollo/client';

export const RECORD_IMPORT_ROWS = gql`
  query RecordImportRows($input: RecordImportRowsInput!) {
    recordImportRows(input: $input) {
      totalCount
      rows
    }
  }
`;
