import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { GET_MY_CALENDAR_CHANNELS } from '@/settings/accounts/graphql/queries/getMyCalendarChannels';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

type MetadataCalendarChannel = {
  id: string;
  handle: string;
  visibility: string;
  syncStatus: string;
  syncStage: string;
  syncStageStartedAt: string | null;
  isContactAutoCreationEnabled: boolean;
  contactAutoCreationPolicy: string;
  isSyncEnabled: boolean;
  connectedAccountId: string;
  createdAt: string;
  updatedAt: string;
};

export const useMyCalendarChannels = () => {
  const apolloClient = useApolloClient();

  const { data: metadataData, loading: metadataLoading } = useQuery<{
    myCalendarChannels: MetadataCalendarChannel[];
  }>(GET_MY_CALENDAR_CHANNELS, {
    client: apolloClient,
  });

  const channels = useMemo(() => {
    if (!metadataData?.myCalendarChannels) {
      return [];
    }

    return metadataData.myCalendarChannels
      .filter(
        (channel: MetadataCalendarChannel) =>
          channel.syncStage !== 'PENDING_CONFIGURATION',
      )
      .map(
        (channel: MetadataCalendarChannel) =>
          ({
            id: channel.id,
            handle: channel.handle,
            visibility: channel.visibility,
            isContactAutoCreationEnabled: channel.isContactAutoCreationEnabled,
            contactAutoCreationPolicy: channel.contactAutoCreationPolicy,
            isSyncEnabled: channel.isSyncEnabled,
            syncStatus: channel.syncStatus,
            syncStage: channel.syncStage,
            syncCursor: '',
            syncStageStartedAt: channel.syncStageStartedAt
              ? new Date(channel.syncStageStartedAt)
              : null,
            throttleFailureCount: 0,
            connectedAccountId: channel.connectedAccountId,
            __typename: 'CalendarChannel',
          }) as CalendarChannel,
      );
  }, [metadataData]);

  return {
    channels,
    loading: metadataLoading,
  };
};
