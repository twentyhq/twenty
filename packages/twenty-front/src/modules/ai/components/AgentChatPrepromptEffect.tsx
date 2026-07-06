import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { agentChatPrepromptState } from '@/ai/states/agentChatPrepromptState';
import { dispatchAgentChatSendMessageEvent } from '@/ai/utils/dispatchAgentChatSendMessageEvent';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

// Applies a pending preprompt (set by useOpenAskAiPageWithPreprompt) once the
// chat editor and send listener are mounted. The dispatch is deferred to a
// macrotask so it runs after the current commit's effects have registered
// their listeners, regardless of mount ordering.
export const AgentChatPrepromptEffect = () => {
  const [agentChatPreprompt, setAgentChatPreprompt] = useAtomState(
    agentChatPrepromptState,
  );

  useEffect(() => {
    if (!isDefined(agentChatPreprompt)) {
      return;
    }

    const { text, mode } = agentChatPreprompt;

    const timeoutId = setTimeout(() => {
      if (mode === 'SEND') {
        dispatchAgentChatSendMessageEvent();
        // Clear the editor once the message has been submitted.
        dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
          content: '',
        });
      } else {
        // Ensure an already-mounted editor reflects the prompt.
        dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
          content: text,
        });
      }

      setAgentChatPreprompt(null);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [agentChatPreprompt, setAgentChatPreprompt]);

  return null;
};
