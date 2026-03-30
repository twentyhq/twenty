import { gql } from '@apollo/client';

export const CANCEL_EXPORT_JOB = gql`
  mutation CancelExportJob($exportJobId: String!) {
    cancelExportJob(exportJobId: $exportJobId) {
      id
      status
      processedRecords
      totalRecords
      result
    }
  }
`;
