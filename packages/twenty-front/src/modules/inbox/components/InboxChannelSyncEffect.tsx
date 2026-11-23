import { useCallback, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { aiChatThreadRecordUpdateCountState } from '@/ai-chat/threads/states/aiChatThreadRecordUpdateCountState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useCanSyncInbox } from '@/inbox/hooks/useCanSyncInbox';
import { useRefreshInboxChannelSummaries } from '@/inbox/hooks/useRefreshInboxChannelSummaries';
import { useRefreshInboxChannels } from '@/inbox/hooks/useRefreshInboxChannels';
import { useRefreshInboxOpenThreadsSummary } from '@/inbox/hooks/useRefreshInboxOpenThreadsSummary';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const INBOX_CHANNELS_REFRESH_DEBOUNCE_MS = 1000;

export const InboxChannelSyncEffect = () => {
  const canSyncInbox = useCanSyncInbox();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const aiChatThreadRecordUpdateCount = useAtomStateValue(
    aiChatThreadRecordUpdateCountState,
  );
  const aiChatThreadParticipants = useAtomStateValue(
    aiChatThreadParticipantsState,
  );

  const { refreshInboxOpenThreadsSummary } =
    useRefreshInboxOpenThreadsSummary();
  const { refreshInboxChannels } = useRefreshInboxChannels();
  const { refreshInboxChannelSummaries } = useRefreshInboxChannelSummaries();

  const isChannelSyncEnabled = isAiChatInboxEnabled && canSyncInbox;

  const debouncedRefreshChannels = useDebouncedCallback(
    () => void refreshInboxChannels(),
    INBOX_CHANNELS_REFRESH_DEBOUNCE_MS,
  );
  const debouncedRefreshSummaries = useDebouncedCallback(() => {
    refreshInboxOpenThreadsSummary();
    void refreshInboxChannelSummaries();
  }, INBOX_CHANNELS_REFRESH_DEBOUNCE_MS);

  useEffect(() => {
    if (isChannelSyncEnabled) {
      void refreshInboxChannels();
    }
  }, [isChannelSyncEnabled, refreshInboxChannels]);

  const handleChannelOperation = useCallback(() => {
    if (isChannelSyncEnabled) {
      debouncedRefreshChannels();
    }
  }, [debouncedRefreshChannels, isChannelSyncEnabled]);

  useListenToMetadataOperationBrowserEvent({
    metadataName: 'agentChatChannel',
    onMetadataOperationBrowserEvent: handleChannelOperation,
    skip: !isChannelSyncEnabled,
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: 'agentChatChannelRole',
    onMetadataOperationBrowserEvent: handleChannelOperation,
    skip: !isChannelSyncEnabled,
  });

  useEffect(() => {
    if (isChannelSyncEnabled) {
      debouncedRefreshSummaries();
    }
  }, [
    aiChatThreadParticipants,
    aiChatThreadRecordUpdateCount,
    debouncedRefreshSummaries,
    isChannelSyncEnabled,
  ]);

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: handleChannelOperation,
  });

  return null;
};
