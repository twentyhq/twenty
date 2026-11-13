import { type Editor } from '@tiptap/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { aiChatSentMessageHandOffState } from '@/ai/states/agentChatSentMessageHandOffState';
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

  useListenToBrowserEvent({
    eventName: AI_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: handOffSentMessage,
  });

  return null;
};
