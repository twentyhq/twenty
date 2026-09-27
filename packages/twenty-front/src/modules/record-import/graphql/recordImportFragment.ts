import { gql } from '@apollo/client';

export const RECORD_IMPORT_FRAGMENT = gql`
  fragment RecordImportFields on RecordImport {
    id
    version
    status
    fileName
    sheetNames
    sheetName
    rowCount
    isMapped
    progress
    processedRowCount
    totalRowCount
    importedRecordCount
    skippedRowCount
    failedRowCount
    errorRowCount
    deletedRowCount
    hasReport
    errorMessage
  }
`;
