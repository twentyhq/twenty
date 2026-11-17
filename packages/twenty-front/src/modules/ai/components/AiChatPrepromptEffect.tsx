import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AiChatRestoreEditorContentEventName';
import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AiChatSendMessageEventName';
import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { aiChatPrepromptState } from '@/ai/states/aiChatPrepromptState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { type AiChatInstanceEventDetail } from '@/ai/types/AiChatInstanceEventDetail';
import { type AiChatRestoreEditorContentEventDetail } from '@/ai/types/AiChatRestoreEditorContentEventDetail';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatPrepromptEffect = () => {
  const store = useStore();
  const { instanceId, threadId } = useAiChatInstanceOrThrow();
  const aiChatPreprompt = useAtomStateValue(aiChatPrepromptState);

  useEffect(() => {
    if (aiChatPreprompt?.threadId !== threadId) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const preprompt = store.get(aiChatPrepromptState.atom);

      if (!isDefined(preprompt) || preprompt.threadId !== threadId) {
        return;
      }

      store.set(aiChatPrepromptState.atom, null);

      dispatchBrowserEvent<AiChatRestoreEditorContentEventDetail>(
        AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
        { threadId, content: preprompt.serializedDocument },
      );

      if (preprompt.mode === 'SEND') {
        dispatchBrowserEvent<AiChatInstanceEventDetail>(
          AI_CHAT_SEND_MESSAGE_EVENT_NAME,
          { instanceId },
        );
      } else {
        store.set(shouldFocusChatEditorState.atom, true);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [aiChatPreprompt, instanceId, threadId, store]);

  return null;
};
