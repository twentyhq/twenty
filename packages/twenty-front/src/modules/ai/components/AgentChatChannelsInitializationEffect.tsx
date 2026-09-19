import { useAtomValue } from 'jotai';
import { useEffect } from 'react';

import { useRefreshAgentChatChannels } from '@/ai/hooks/useRefreshAgentChatChannels';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const AgentChatChannelsInitializationEffect = () => {
  const { refreshAgentChatChannels } = useRefreshAgentChatChannels();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const channelsStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatChannels'),
  );

  useEffect(() => {
    if (channelsStoreEntry.status !== 'empty' || !hasAiPermission) {
      return;
    }

    void refreshAgentChatChannels();
  }, [channelsStoreEntry.status, hasAiPermission, refreshAgentChatChannels]);

  // Membership changes made while the stream was down are not replayed, so a
  // reconnect takes a fresh snapshot.
  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: () => {
      if (hasAiPermission) {
        void refreshAgentChatChannels();
      }
    },
  });

  return null;
};
