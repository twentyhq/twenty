import { gql } from '@apollo/client';

export const GET_EXPORT_JOB = gql`
  query ExportJob($exportJobId: String!) {
    exportJob(exportJobId: $exportJobId) {
      id
      objectNameSingular
      format
      status
      totalRecords
      processedRecords
      result
      createdAt
    }
  }
`;
