import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_REFETCH_PARTICIPANTS_EVENT_NAME } from '@/ai/constants/AgentChatRefetchParticipantsEventName';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatThreadParticipantsComponentFamilyState } from '@/ai/states/agentChatThreadParticipantsComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useQueryWithCallbacks } from '@/apollo/hooks/useQueryWithCallbacks';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import {
  GetChatThreadParticipantsDocument,
  type GetChatThreadParticipantsQuery,
} from '~/generated-metadata/graphql';

export const AgentChatThreadParticipantsFetchEffect = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const isNewThread =
    !isDefined(currentAiChatThread) ||
    currentAiChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY;

  const setAgentChatThreadParticipants = useSetAtomComponentFamilyState(
    agentChatThreadParticipantsComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  const handleDataLoaded = useCallback(
    (data: GetChatThreadParticipantsQuery) => {
      setAgentChatThreadParticipants(data.chatThreadParticipants ?? []);
    },
    [setAgentChatThreadParticipants],
  );

  const { refetch: refetchParticipants } = useQueryWithCallbacks(
    GetChatThreadParticipantsDocument,
    {
      variables: { threadId: currentAiChatThread ?? '' },
      skip: isNewThread,
      onDataLoaded: handleDataLoaded,
    },
  );

  const handleRefetchParticipants = useCallback(() => {
    if (isNewThread) {
      return;
    }

    refetchParticipants();
  }, [refetchParticipants, isNewThread]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_REFETCH_PARTICIPANTS_EVENT_NAME,
    onBrowserEvent: handleRefetchParticipants,
  });

  return null;
};
