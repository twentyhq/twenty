import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { agentChatPrepromptState } from '@/ai/states/agentChatPrepromptState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AgentChatPrepromptEffect = () => {
  const [agentChatPreprompt, setAgentChatPreprompt] = useAtomState(
    agentChatPrepromptState,
  );
  const setShouldFocusChatEditor = useSetAtomState(shouldFocusChatEditorState);

  useEffect(() => {
    if (!isDefined(agentChatPreprompt)) {
      return;
    }

    const { serializedDocument, mode } = agentChatPreprompt;

    const timeoutId = setTimeout(() => {
      if (mode === 'SEND') {
        dispatchBrowserEvent(AGENT_CHAT_SEND_MESSAGE_EVENT_NAME);
        dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
          content: '',
        });
      } else {
        dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
          content: serializedDocument,
        });
        setShouldFocusChatEditor(true);
      }

      setAgentChatPreprompt(null);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [agentChatPreprompt, setAgentChatPreprompt, setShouldFocusChatEditor]);

  return null;
};
