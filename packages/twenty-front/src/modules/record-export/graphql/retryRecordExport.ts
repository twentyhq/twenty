import { gql } from '@apollo/client';

export const RETRY_RECORD_EXPORT = gql`
  mutation RetryRecordExport($id: UUID!) {
    retryRecordExport(id: $id) {
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
