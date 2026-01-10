import { useQuery } from '@apollo/client';

import { GET_SYNC_STATISTICS } from '@/settings/accounts/graphql/queries/getSyncStatistics';

type SyncStatisticsResult = {
  syncStatus: string;
  syncStage: string;
  importedMessages: number;
  pendingMessages: number;
  contactsCreated: number;
  companiesCreated: number;
};

type GetSyncStatisticsQuery = {
  getSyncStatistics: SyncStatisticsResult;
};

type GetSyncStatisticsQueryVariables = {
  messageChannelId: string;
};

export const useGetSyncStatistics = (messageChannelId: string) => {
  return useQuery<GetSyncStatisticsQuery, GetSyncStatisticsQueryVariables>(
    GET_SYNC_STATISTICS,
    {
      variables: { messageChannelId },
      skip: !messageChannelId,
      pollInterval: 5000,
    },
  );
};
