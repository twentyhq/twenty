import { useCallback, useEffect } from 'react';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { useDebouncedCallback } from 'use-debounce';

import { useRefreshAgentChatChannelSummaries } from '@/ai/hooks/useRefreshAgentChatChannelSummaries';
import { useRefreshAgentChatChannels } from '@/ai/hooks/useRefreshAgentChatChannels';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
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
const AGENT_CHAT_CHANNELS_REFRESH_DEBOUNCE_MS = 1000;

export const AgentChatChannelsEffect = () => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );
  const isEnabled =
    isAiChatInboxEnabled && hasAiPermission && !isWorkspaceSuspended;

  const { refreshAgentChatChannels } = useRefreshAgentChatChannels();
  const { refreshAgentChatChannelSummaries } =
    useRefreshAgentChatChannelSummaries();

  const debouncedRefreshChannels = useDebouncedCallback(
    () => void refreshAgentChatChannels(),
    AGENT_CHAT_CHANNELS_REFRESH_DEBOUNCE_MS,
  );
  const debouncedRefreshSummaries = useDebouncedCallback(
    () => void refreshAgentChatChannelSummaries(),
    AGENT_CHAT_CHANNELS_REFRESH_DEBOUNCE_MS,
  );

  useEffect(() => {
    if (isEnabled) {
      void refreshAgentChatChannels();
    }
  }, [isEnabled, refreshAgentChatChannels]);

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

  const agentChatThreadRecordUpdateCount = useAtomStateValue(
    agentChatThreadRecordUpdateCountState,
  );
  const agentChatThreadParticipants = useAtomStateValue(
    agentChatThreadParticipantsState,
  );

  useEffect(() => {
    if (isEnabled) {
      debouncedRefreshSummaries();
    }
  }, [
    agentChatThreadParticipants,
    debouncedRefreshSummaries,
    isEnabled,
    agentChatThreadRecordUpdateCount,
  ]);

  return null;
};
