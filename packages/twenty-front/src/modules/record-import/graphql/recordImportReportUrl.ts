import { gql } from '@apollo/client';

export const RECORD_IMPORT_REPORT_URL = gql`
  query RecordImportReportUrl($input: RecordImportSessionInput!) {
    recordImportReportUrl(input: $input)
  }
`;
