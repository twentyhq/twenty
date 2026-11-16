import { useAiChatComposerThreadId } from '@/ai/hooks/useAiChatComposerThreadId';
import { type AiChatThreadEventDetail } from '@/ai/types/AiChatThreadEventDetail';
import { type Editor } from '@tiptap/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AiChatSendMessageEventName';
import { aiChatSentMessageHandOffState } from '@/ai/states/aiChatSentMessageHandOffState';
import { getTextBoundingClientRect } from '@/ai/utils/getTextBoundingClientRect';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';

type AiChatSentMessageHandOffEffectProps = {
  editor: Editor | null;
  isComposerCentered: boolean;
};

export const AiChatSentMessageHandOffEffect = ({
  editor,
  isComposerCentered,
}: AiChatSentMessageHandOffEffectProps) => {
  const store = useStore();
  const aiChatComposerThreadId = useAiChatComposerThreadId();

  const handOffSentMessage = (detail?: AiChatThreadEventDetail) => {
    if (detail?.threadId !== aiChatComposerThreadId) {
      return;
    }

    if (!isComposerCentered) {
      store.set(aiChatSentMessageHandOffState.atom, null);
      return;
    }

    if (
      !isDefined(editor) ||
      editor.isDestroyed ||
      !isNonEmptyString(editor.getText().trim())
    ) {
      return;
    }

    store.set(aiChatSentMessageHandOffState.atom, {
      composerTextRect: getTextBoundingClientRect(editor.view.dom),
      messageId: null,
    });
  };

  useListenToBrowserEvent<AiChatThreadEventDetail>({
    eventName: AI_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: handOffSentMessage,
  });

  return null;
};
