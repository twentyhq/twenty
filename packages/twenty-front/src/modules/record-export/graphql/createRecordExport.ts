import { gql } from '@apollo/client';

export const CREATE_RECORD_EXPORT = gql`
  mutation CreateRecordExport($input: CreateRecordExportInput!) {
    createRecordExport(input: $input) {
      id
      workspaceId
      workspaceMemberId
      filename
      status
      processedRecordCount
      errorMessage
      createdAt
      updatedAt
      expiresAt
    }
  }
`;
