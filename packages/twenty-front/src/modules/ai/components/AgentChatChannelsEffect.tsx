import { useCallback, useEffect, useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { useDebouncedCallback } from 'use-debounce';

import { useRefreshAgentChatChannels } from '@/ai/hooks/useRefreshAgentChatChannels';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { PermissionFlagType } from '~/generated-metadata/graphql';

// Changes come in bursts, as a message updates a chat and its members' rows
const AGENT_CHAT_CHANNELS_REFRESH_DEBOUNCE_MS = 1000;

// Channels and their counts follow changes made anywhere: a channel or a
// membership changing reloads the list, a chat or a member's row changing
// reloads the counts
export const AgentChatChannelsEffect = () => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );
  const channelObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: CoreObjectNameSingular.AgentChatChannel,
      objectNameType: 'singular',
    },
  );
  const channelMemberObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: CoreObjectNameSingular.AgentChatChannelMember,
      objectNameType: 'singular',
    },
  );
  const isEnabled =
    hasAiPermission &&
    !isWorkspaceSuspended &&
    isDefined(channelObjectMetadataItem);

  const { refreshAgentChatChannels, refreshAgentChatChannelSummaries } =
    useRefreshAgentChatChannels();

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

  const channelOperationSignature = useMemo(
    () => ({
      objectNameSingular: CoreObjectNameSingular.AgentChatChannel,
      variables: {},
    }),
    [],
  );
  const channelMemberOperationSignature = useMemo(
    () => ({
      objectNameSingular: CoreObjectNameSingular.AgentChatChannelMember,
      variables: {},
    }),
    [],
  );

  useListenToEventsForQuery({
    queryId: 'agent-chat-channel-operations',
    operationSignature: channelOperationSignature,
    skip: !isEnabled,
    onSseReconnected: refreshAgentChatChannels,
  });
  useListenToEventsForQuery({
    queryId: 'agent-chat-channel-member-operations',
    operationSignature: channelMemberOperationSignature,
    skip: !isEnabled || !isDefined(channelMemberObjectMetadataItem),
  });

  const handleChannelOperation = useCallback(
    () => debouncedRefreshChannels(),
    [debouncedRefreshChannels],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleChannelOperation,
    objectMetadataItemId: channelObjectMetadataItem?.id,
    enabled: isEnabled,
  });
  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleChannelOperation,
    objectMetadataItemId: channelMemberObjectMetadataItem?.id,
    enabled: isEnabled && isDefined(channelMemberObjectMetadataItem),
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
