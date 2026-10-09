import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useUpdateMessageChannelApolloCache } from '@/settings/accounts/hooks/useUpdateMessageChannelApolloCache';

export const SettingsAccountsMessageChannelsSSEEffect = () => {
  const { updateMessageChannelApolloCache } =
    useUpdateMessageChannelApolloCache();

  useListenToMetadataOperationBrowserEvent({
    metadataName: 'messageChannel',
    onMetadataOperationBrowserEvent: updateMessageChannelApolloCache,
  });

  return null;
};
