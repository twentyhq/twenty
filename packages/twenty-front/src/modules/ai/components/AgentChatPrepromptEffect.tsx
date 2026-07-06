import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { agentChatPrepromptState } from '@/ai/states/agentChatPrepromptState';
import { dispatchAgentChatSendMessageEvent } from '@/ai/utils/dispatchAgentChatSendMessageEvent';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

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
        dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
          content: '',
        });
      } else {
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
