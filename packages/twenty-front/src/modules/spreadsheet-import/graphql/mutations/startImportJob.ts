import gql from 'graphql-tag';

export const START_IMPORT_JOB = gql`
  mutation StartImportJob(
    $objectNameSingular: String!
    $columnMappings: JSON!
    $validatedRows: JSON!
    $fileName: String
  ) {
    startImportJob(
      objectNameSingular: $objectNameSingular
      columnMappings: $columnMappings
      validatedRows: $validatedRows
      fileName: $fileName
    ) {
      id
      objectNameSingular
      fileName
      status
      totalRecords
      processedRecords
      createdAt
    }
  }
`;
