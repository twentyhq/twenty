import { useStore } from 'jotai';
import { useEffect, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { agentChatDraftChannelIdState } from '@/ai/states/agentChatDraftChannelIdState';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';

type AiChatChannelDraftThreadEffectProps = {
  channelId: string;
};

// Without a thread in the URL, the channel page shows a new chat of the
// channel: typing creates the thread in the channel, and the URL projection
// then names it so the list beside the chat selects it.
export const AiChatChannelDraftThreadEffect = ({
  channelId,
}: AiChatChannelDraftThreadEffectProps) => {
  const store = useStore();
  const { threadId } = useParams();
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();

  useLayoutEffect(() => {
    if (isDefined(threadId)) {
      return;
    }

    store.set(threadIdCreatedFromDraftState.atom, null);
    store.set(hasTriggeredCreateForDraftState.atom, false);
    store.set(agentChatDraftChannelIdState.atom, channelId);
    switchThreadWithDraft(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
    // The draft is reselected when the URL loses its thread or the channel
    // changes, not whenever the switch callback is recreated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, threadId, store]);

  useEffect(
    () => () => {
      if (store.get(agentChatDraftChannelIdState.atom) === channelId) {
        store.set(agentChatDraftChannelIdState.atom, null);
      }
    },
    [channelId, store],
  );

  return null;
};
