import gql from 'graphql-tag';

export const CANCEL_IMPORT_JOB = gql`
  mutation CancelImportJob($importJobId: String!) {
    cancelImportJob(importJobId: $importJobId) {
      id
      status
    }
  }
`;
