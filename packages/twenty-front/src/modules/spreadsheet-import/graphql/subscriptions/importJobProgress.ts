import gql from 'graphql-tag';

export const IMPORT_JOB_PROGRESS_SUBSCRIPTION = gql`
  subscription OnImportJobProgress($importJobId: String!) {
    onImportJobProgress(importJobId: $importJobId) {
      importJobId
      status
      processedRecords
      totalRecords
      successCount
      warningCount
      failureCount
      result
    }
  }
`;
