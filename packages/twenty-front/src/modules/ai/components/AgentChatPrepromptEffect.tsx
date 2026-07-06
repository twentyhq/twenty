import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { agentChatPrepromptState } from '@/ai/states/agentChatPrepromptState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { dispatchAgentChatSendMessageEvent } from '@/ai/utils/dispatchAgentChatSendMessageEvent';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const AgentChatPrepromptEffect = () => {
  const [agentChatPreprompt, setAgentChatPreprompt] = useAtomState(
    agentChatPrepromptState,
  );
  const store = useStore();

  useEffect(() => {
    if (!isDefined(agentChatPreprompt)) {
      return;
    }

    const { text, mode, threadId } = agentChatPreprompt;

    const timeoutId = setTimeout(() => {
      // Skip if the thread changed since the preprompt was requested, so we
      // never send or prefill into the wrong conversation.
      if (store.get(currentAiChatThreadState.atom) === threadId) {
        if (mode === 'SEND') {
          dispatchAgentChatSendMessageEvent();
          dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
            content: '',
          });
        } else {
          dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
            content: text,
          });
        }
      }

      setAgentChatPreprompt(null);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [agentChatPreprompt, setAgentChatPreprompt, store]);

  return null;
};
