import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatPrepromptState } from '@/ai/states/agentChatPrepromptState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { dispatchAgentChatSendMessageEvent } from '@/ai/utils/dispatchAgentChatSendMessageEvent';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AgentChatPrepromptEffect = () => {
  const store = useStore();
  const [agentChatPreprompt, setAgentChatPreprompt] = useAtomState(
    agentChatPrepromptState,
  );
  const setShouldFocusChatEditor = useSetAtomState(shouldFocusChatEditorState);

  useEffect(() => {
    if (!isDefined(agentChatPreprompt)) {
      return;
    }

    const { draftKey, mode } = agentChatPreprompt;

    const timeoutId = setTimeout(() => {
      if (mode === 'SEND') {
        dispatchAgentChatSendMessageEvent();
        dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
          content: '',
        });
      } else {
        dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
          content:
            store.get(agentChatDraftsByThreadIdState.atom)[draftKey]
              ?.serializedDocument ?? '',
        });
        setShouldFocusChatEditor(true);
      }

      setAgentChatPreprompt(null);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [
    agentChatPreprompt,
    setAgentChatPreprompt,
    setShouldFocusChatEditor,
    store,
  ]);

  return null;
};
