import gql from 'graphql-tag';

export const FINALIZE_IMPORT_JOB = gql`
  mutation FinalizeImportJob($importJobId: String!) {
    finalizeImportJob(importJobId: $importJobId) {
      id
      status
      totalRecords
    }
  }
`;
