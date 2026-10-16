import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { useApolloClient } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

type MessageChannelSyncBroadcastRecord = Pick<
  MessageChannel,
  'id' | 'syncStatus' | 'syncStage' | 'importProgress'
>;

export const useUpdateMessageChannelApolloCache = () => {
  const apolloClient = useApolloClient();

  const updateMessageChannelApolloCache = (
    detail: MetadataOperationBrowserEventDetail<MessageChannelSyncBroadcastRecord>,
  ) => {
    if (detail.operation.type !== 'update') {
      return;
    }

    const { updatedRecord } = detail.operation;

    apolloClient.cache.updateQuery<{ myMessageChannels: MessageChannel[] }>(
      { query: GET_MY_MESSAGE_CHANNELS },
      (existingData) => {
        if (!isDefined(existingData?.myMessageChannels)) {
          return existingData;
        }

        return {
          ...existingData,
          myMessageChannels: existingData.myMessageChannels.map(
            (messageChannel) =>
              messageChannel.id === updatedRecord.id
                ? { ...messageChannel, ...updatedRecord }
                : messageChannel,
          ),
        };
      },
    );
  };

  return { updateMessageChannelApolloCache };
};
