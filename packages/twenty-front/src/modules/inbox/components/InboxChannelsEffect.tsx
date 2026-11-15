import { useCallback, useEffect } from 'react';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { useDebouncedCallback } from 'use-debounce';

import { useRefreshInboxChannelSummaries } from '@/inbox/hooks/useRefreshInboxChannelSummaries';
import { useRefreshInboxChannels } from '@/inbox/hooks/useRefreshInboxChannels';
import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import { aiChatThreadRecordUpdateCountState } from '@/ai/states/aiChatThreadRecordUpdateCountState';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

// Changes come in bursts, as a message updates a chat and its members' rows
const INBOX_CHANNELS_REFRESH_DEBOUNCE_MS = 1000;

export const InboxChannelsEffect = () => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );
  const isEnabled =
    isAiChatInboxEnabled && hasAiPermission && !isWorkspaceSuspended;

  const { refreshInboxChannels } = useRefreshInboxChannels();
  const { refreshInboxChannelSummaries } = useRefreshInboxChannelSummaries();

  const debouncedRefreshChannels = useDebouncedCallback(
    () => void refreshInboxChannels(),
    INBOX_CHANNELS_REFRESH_DEBOUNCE_MS,
  );
  const debouncedRefreshSummaries = useDebouncedCallback(
    () => void refreshInboxChannelSummaries(),
    INBOX_CHANNELS_REFRESH_DEBOUNCE_MS,
  );

  useEffect(() => {
    if (isEnabled) {
      void refreshInboxChannels();
    }
  }, [isEnabled, refreshInboxChannels]);

  const handleChannelOperation = useCallback(() => {
    if (isEnabled) {
      debouncedRefreshChannels();
    }
  }, [debouncedRefreshChannels, isEnabled]);

  useListenToMetadataOperationBrowserEvent({
    metadataName: 'agentChatChannel',
    onMetadataOperationBrowserEvent: handleChannelOperation,
    skip: !isEnabled,
  });
  useListenToMetadataOperationBrowserEvent({
    metadataName: 'agentChatChannelRole',
    onMetadataOperationBrowserEvent: handleChannelOperation,
    skip: !isEnabled,
  });
  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: handleChannelOperation,
  });

  const aiChatThreadRecordUpdateCount = useAtomStateValue(
    aiChatThreadRecordUpdateCountState,
  );
  const aiChatThreadParticipants = useAtomStateValue(
    aiChatThreadParticipantsState,
  );

  useEffect(() => {
    if (isEnabled) {
      debouncedRefreshSummaries();
    }
  }, [
    aiChatThreadParticipants,
    debouncedRefreshSummaries,
    isEnabled,
    aiChatThreadRecordUpdateCount,
  ]);

  return null;
};
