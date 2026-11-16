import { useStore } from 'jotai';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type AiChatRestoreEditorContentEventDetail } from '@/ai/types/AiChatRestoreEditorContentEventDetail';
import { type AiChatThreadEventDetail } from '@/ai/types/AiChatThreadEventDetail';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AiChatRestoreEditorContentEventName';
import { aiChatPrepromptState } from '@/ai/states/aiChatPrepromptState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AiChatSendMessageEventName';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AiChatPrepromptEffect = () => {
  const [aiChatPreprompt, setAiChatPreprompt] =
    useAtomState(aiChatPrepromptState);
  const setShouldFocusChatEditor = useSetAtomState(shouldFocusChatEditorState);
  const store = useStore();

  useEffect(() => {
    if (!isDefined(aiChatPreprompt)) {
      return;
    }

    const { serializedDocument, mode } = aiChatPreprompt;

    const timeoutId = setTimeout(() => {
      const threadId =
        store.get(currentAiChatThreadState.atom) ??
        store.get(newAiChatThreadIdState.atom);

      dispatchBrowserEvent<AiChatRestoreEditorContentEventDetail>(
        AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
        { threadId, content: serializedDocument },
      );

      if (mode === 'SEND') {
        dispatchBrowserEvent<AiChatThreadEventDetail>(
          AI_CHAT_SEND_MESSAGE_EVENT_NAME,
          { threadId },
        );
      } else {
        setShouldFocusChatEditor(true);
      }

      setAiChatPreprompt(null);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [aiChatPreprompt, setAiChatPreprompt, setShouldFocusChatEditor, store]);

  return null;
};
