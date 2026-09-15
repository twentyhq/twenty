import { gql } from '@apollo/client';

export const FIND_MANY_RECORD_EXPORTS = gql`
  query FindManyRecordExports {
    findManyRecordExports {
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
