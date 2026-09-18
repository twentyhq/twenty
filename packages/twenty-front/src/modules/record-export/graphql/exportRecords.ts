import { gql } from '@apollo/client';

export const EXPORT_RECORDS = gql`
  subscription ExportRecords($input: CreateRecordExportInput!) {
    exportRecords(input: $input) {
      id
      filename
      progress
      errorMessage
      downloadUrl
    }
  }
`;
