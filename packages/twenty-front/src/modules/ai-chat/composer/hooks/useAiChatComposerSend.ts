import { isNonEmptyString } from '@sniptt/guards';
import { type Editor } from '@tiptap/react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai-chat/constants/AiChatSendMessageEventName';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useAiChat } from '@/ai-chat/composer/hooks/useSendAiChatMessage';
import { aiChatSentMessageHandOffState } from '@/ai-chat/states/aiChatSentMessageHandOffState';
import { type AiChatInstanceEventDetail } from '@/ai-chat/types/AiChatInstanceEventDetail';
import { getTextBoundingClientRect } from '@/ai-chat/utils/getTextBoundingClientRect';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';

// The editor's key handler is created once, so Enter and the send button reach the composer through an event
export const useAiChatComposerSend = ({
  editor,
  isComposerCentered,
}: {
  editor: Editor | null;
  isComposerCentered: boolean;
}) => {
  const store = useStore();
  const { instanceId } = useAiChatInstanceOrThrow();
  const { handleSendMessage } = useAiChat();

  const handOffSentMessage = () => {
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

  useListenToBrowserEvent<AiChatInstanceEventDetail>({
    eventName: AI_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: (detail) => {
      if (detail?.instanceId !== instanceId) {
        return;
      }

      handOffSentMessage();
      void handleSendMessage();
    },
  });
};
