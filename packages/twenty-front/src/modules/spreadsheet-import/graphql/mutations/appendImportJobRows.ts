import gql from 'graphql-tag';

export const APPEND_IMPORT_JOB_ROWS = gql`
  mutation AppendImportJobRows($importJobId: String!, $rows: JSON!) {
    appendImportJobRows(importJobId: $importJobId, rows: $rows) {
      importJobId
      totalRecords
    }
  }
`;
