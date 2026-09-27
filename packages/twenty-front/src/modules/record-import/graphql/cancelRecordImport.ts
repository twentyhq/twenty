import { gql } from '@apollo/client';

export const CANCEL_RECORD_IMPORT = gql`
  mutation CancelRecordImport($input: RecordImportSessionInput!) {
    cancelRecordImport(input: $input)
  }
`;
