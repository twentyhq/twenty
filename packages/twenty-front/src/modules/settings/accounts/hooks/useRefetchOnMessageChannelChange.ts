import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useCallback } from 'react';

type MessageChannelBroadcastRecord = { id: string };

type UseRefetchOnMessageChannelChangeArgs = {
  refetch: () => void;
};

export const useRefetchOnMessageChannelChange = ({
  refetch,
}: UseRefetchOnMessageChannelChangeArgs) => {
  const onMessageChannelOperation = useCallback(() => {
    refetch();
  }, [refetch]);

  useListenToMetadataOperationBrowserEvent<MessageChannelBroadcastRecord>({
    metadataName: 'messageChannel',
    onMetadataOperationBrowserEvent: onMessageChannelOperation,
  });
};
