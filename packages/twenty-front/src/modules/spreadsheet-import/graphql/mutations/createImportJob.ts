import gql from 'graphql-tag';

export const CREATE_IMPORT_JOB = gql`
  mutation CreateImportJob(
    $objectNameSingular: String!
    $columnMappings: JSON!
    $fileName: String
  ) {
    createImportJob(
      objectNameSingular: $objectNameSingular
      columnMappings: $columnMappings
      fileName: $fileName
    ) {
      id
      status
      totalRecords
    }
  }
`;
