import { gql } from '@apollo/client';

export const GET_ADMIN_CHAT_THREADS = gql`
  query GetAdminChatThreads(
    $scope: AdminChatThreadScope
    $hasErrorOnly: Boolean
    $userNeverEngagedOnly: Boolean
    $searchTerm: String
    $sortBy: AdminChatThreadSortField
    $sortDirection: AdminChatThreadSortDirection
    $limit: Int
    $offset: Int
  ) {
    getAdminChatThreads(
      scope: $scope
      hasErrorOnly: $hasErrorOnly
      userNeverEngagedOnly: $userNeverEngagedOnly
      searchTerm: $searchTerm
      sortBy: $sortBy
      sortDirection: $sortDirection
      limit: $limit
      offset: $offset
    ) {
      totalCount
      hasMore
      threads {
        id
        title
        workspaceId
        workspaceDisplayName
        userWorkspaceId
        userEmail
        userFirstName
        userLastName
        messageCount
        userMessageCount
        hasError
        isOnboardingThread
        deletedAt
        createdAt
        updatedAt
      }
    }
  }
`;
