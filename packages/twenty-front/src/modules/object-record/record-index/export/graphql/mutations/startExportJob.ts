import { gql } from '@apollo/client';

export const START_EXPORT_JOB = gql`
  mutation StartExportJob(
    $objectNameSingular: String!
    $columns: JSON!
    $filter: JSON
    $orderBy: JSON
    $relationConfigs: JSON
    $format: String
  ) {
    startExportJob(
      objectNameSingular: $objectNameSingular
      columns: $columns
      filter: $filter
      orderBy: $orderBy
      relationConfigs: $relationConfigs
      format: $format
    ) {
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
