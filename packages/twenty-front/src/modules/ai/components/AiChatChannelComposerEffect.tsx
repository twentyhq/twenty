import { useStore } from 'jotai';
import { useEffect, useLayoutEffect } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { agentChatDraftChannelIdState } from '@/ai/states/agentChatDraftChannelIdState';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { agentChatHasMessageComponentSelector } from '@/ai/states/selectors/agentChatHasMessageComponentSelector';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatChannelComposerEffectProps = {
  channelId: string;
};

// The channel page composer writes on the new-thread draft slot with the
// channel attached, so typing creates a thread in the channel; the page hands
// over to that thread's chat page once its first message is sent.
export const AiChatChannelComposerEffect = ({
  channelId,
}: AiChatChannelComposerEffectProps) => {
  const store = useStore();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatHasMessage = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
  const { navigateToAiChatPage } = useNavigateToAiChatPage();

  useLayoutEffect(() => {
    store.set(threadIdCreatedFromDraftState.atom, null);
    store.set(hasTriggeredCreateForDraftState.atom, false);
    store.set(agentChatDraftChannelIdState.atom, channelId);
    switchThreadWithDraft(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);

    return () => {
      if (store.get(agentChatDraftChannelIdState.atom) === channelId) {
        store.set(agentChatDraftChannelIdState.atom, null);
      }
    };
    // The draft is reselected when the channel changes, not whenever the
    // switch callback is recreated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, store]);

  useEffect(() => {
    if (!agentChatHasMessage) {
      return;
    }

    // Read from the store: the render this effect belongs to can still carry
    // the thread the user came from, which the layout effect above replaced.
    const threadId = store.get(currentAiChatThreadState.atom);

    if (isDefined(threadId) && isValidUuid(threadId)) {
      navigateToAiChatPage({ threadId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAiChatThread, agentChatHasMessage, store]);

  return null;
};
