import { gql } from '@apollo/client';

export const RECORD_IMPORT_COLUMN_SAMPLES = gql`
  query RecordImportColumnSamples($input: RecordImportSessionInput!) {
    recordImportColumnSamples(input: $input) {
      headerValues
      exampleRows
      distinctValuesByColumn
    }
  }
`;
