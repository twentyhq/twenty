import { useCallback, useEffect } from 'react';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { useRefreshAgentChatThreadRowMetadata } from '@/ai/hooks/useRefreshAgentChatThreadRowMetadata';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';

type AgentChatThreadRowMetadataEffectProps = {
  threads: AgentChatThreadRecord[];
};

export const AgentChatThreadRowMetadataEffect = ({
  threads,
}: AgentChatThreadRowMetadataEffectProps) => {
  const { refreshAgentChatThreadRowMetadata } =
    useRefreshAgentChatThreadRowMetadata();

  useEffect(() => {
    let isActive = true;
    void refreshAgentChatThreadRowMetadata({
      threads,
      isCurrentRequest: () => isActive,
    });

    return () => {
      isActive = false;
    };
  }, [refreshAgentChatThreadRowMetadata, threads]);

  const refresh = useCallback(() => {
    void refreshAgentChatThreadRowMetadata({ threads });
  }, [refreshAgentChatThreadRowMetadata, threads]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME,
    onBrowserEvent: refresh,
  });
  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: refresh,
  });

  return null;
};
