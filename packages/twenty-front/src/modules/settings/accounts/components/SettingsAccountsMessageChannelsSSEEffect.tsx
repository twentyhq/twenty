import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { useUpdateMessageChannelApolloCache } from '@/settings/accounts/hooks/useUpdateMessageChannelApolloCache';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useApolloClient } from '@apollo/client/react';

export const SettingsAccountsMessageChannelsSSEEffect = () => {
  const apolloClient = useApolloClient();

  const { updateMessageChannelApolloCache } =
    useUpdateMessageChannelApolloCache();

  useListenToMetadataOperationBrowserEvent({
    metadataName: 'messageChannel',
    onMetadataOperationBrowserEvent: updateMessageChannelApolloCache,
  });

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: () =>
      apolloClient.refetchQueries({ include: [GET_MY_MESSAGE_CHANNELS] }),
  });

  return null;
};
