import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import {
  type CalendarChannel,
  CalendarChannelSyncStage,
} from '@/accounts/types/CalendarChannel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { GET_MY_CALENDAR_CHANNELS } from '@/settings/accounts/graphql/queries/getMyCalendarChannels';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { CoreObjectNameSingular, FeatureFlagKey } from 'twenty-shared/types';

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
  const featureFlagsMap = useFeatureFlagsMap();
  const isMigrated =
    featureFlagsMap[FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED] ?? false;

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const apolloClient = useApolloClient();

  const { records: workspaceAccounts } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
    skip: isMigrated,
  });

  const { records: workspaceChannels, loading: workspaceLoading } =
    useFindManyRecords<
      CalendarChannel & { connectedAccount: ConnectedAccount }
    >({
      objectNameSingular: CoreObjectNameSingular.CalendarChannel,
      filter: {
        connectedAccountId: {
          in: workspaceAccounts.map((account) => account.id),
        },
        syncStage: {
          neq: CalendarChannelSyncStage.PENDING_CONFIGURATION,
        },
      },
      skip: isMigrated || !workspaceAccounts.length,
    });

  const { data: metadataData, loading: metadataLoading } = useQuery<{
    myCalendarChannels: MetadataCalendarChannel[];
  }>(GET_MY_CALENDAR_CHANNELS, {
    client: apolloClient,
    skip: !isMigrated,
  });

  const channels = useMemo(() => {
    if (!isMigrated) {
      return workspaceChannels;
    }

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
  }, [isMigrated, workspaceChannels, metadataData]);

  return {
    channels,
    loading: isMigrated ? metadataLoading : workspaceLoading,
  };
};
