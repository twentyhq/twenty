import gql from 'graphql-tag';

export const GET_SYNC_STATISTICS = gql`
  query GetSyncStatistics($messageChannelId: UUID!) {
    getSyncStatistics(messageChannelId: $messageChannelId) {
      syncStatus
      syncStage
      importedMessages
      pendingMessages
      contactsCreated
      companiesCreated
    }
  }
`;
