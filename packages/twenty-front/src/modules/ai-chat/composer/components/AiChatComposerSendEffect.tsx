import { isNonEmptyString } from '@sniptt/guards';
import { type Editor } from '@tiptap/react';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAiChat } from '@/ai-chat/composer/hooks/useAiChat';
import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai-chat/constants/AiChatSendMessageEventName';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatSentMessageHandOffState } from '@/ai-chat/states/aiChatSentMessageHandOffState';
import { aiChatComposerShouldSendFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldSendFamilyState';
import { type AiChatInstanceEventDetail } from '@/ai-chat/types/AiChatInstanceEventDetail';
import { getTextBoundingClientRect } from '@/ai-chat/utils/getTextBoundingClientRect';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

type AiChatComposerSendEffectProps = {
  editor: Editor | null;
  isComposerCentered: boolean;
};

export const AiChatComposerSendEffect = ({
  editor,
  isComposerCentered,
}: AiChatComposerSendEffectProps) => {
  const store = useStore();
  const { instanceId, threadId } = useAiChatInstanceOrThrow();
  const { handleSendMessage } = useAiChat();
  const aiChatComposerShouldSend = useAtomFamilyStateValue(
    aiChatComposerShouldSendFamilyState,
    { threadId },
  );

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

  useEffect(() => {
    if (!aiChatComposerShouldSend) {
      return;
    }

    store.set(
      aiChatComposerShouldSendFamilyState.atomFamily({ threadId }),
      false,
    );
    void handleSendMessage();
  }, [aiChatComposerShouldSend, handleSendMessage, store, threadId]);

  return null;
};
