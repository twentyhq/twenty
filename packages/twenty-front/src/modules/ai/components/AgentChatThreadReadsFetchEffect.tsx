import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_REFETCH_READS_EVENT_NAME } from '@/ai/constants/AgentChatRefetchReadsEventName';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatThreadReadsComponentFamilyState } from '@/ai/states/agentChatThreadReadsComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useQueryWithCallbacks } from '@/apollo/hooks/useQueryWithCallbacks';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import {
  GetChatThreadReadsDocument,
  type GetChatThreadReadsQuery,
} from '~/generated-metadata/graphql';

export const AgentChatThreadReadsFetchEffect = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const isNewThread =
    !isDefined(currentAiChatThread) ||
    currentAiChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY;

  const setAgentChatThreadReads = useSetAtomComponentFamilyState(
    agentChatThreadReadsComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  const handleDataLoaded = useCallback(
    (data: GetChatThreadReadsQuery) => {
      setAgentChatThreadReads(data.chatThreadReads ?? []);
    },
    [setAgentChatThreadReads],
  );

  const { refetch: refetchReads } = useQueryWithCallbacks(
    GetChatThreadReadsDocument,
    {
      variables: { threadId: currentAiChatThread ?? '' },
      skip: isNewThread,
      onDataLoaded: handleDataLoaded,
    },
  );

  const handleRefetchReads = useCallback(() => {
    if (isNewThread) {
      return;
    }

    refetchReads();
  }, [refetchReads, isNewThread]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_REFETCH_READS_EVENT_NAME,
    onBrowserEvent: handleRefetchReads,
  });

  return null;
};
