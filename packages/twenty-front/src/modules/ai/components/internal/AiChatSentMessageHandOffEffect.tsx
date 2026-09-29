import { type Editor } from '@tiptap/react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { agentChatSentMessageHandOffState } from '@/ai/states/agentChatSentMessageHandOffState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
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
    const currentAiChatThread = store.get(currentAiChatThreadState.atom);

    if (
      !isComposerCentered ||
      !isDefined(currentAiChatThread) ||
      !isDefined(editor) ||
      editor.isDestroyed ||
      editor.getText().trim() === ''
    ) {
      return;
    }

    store.set(agentChatSentMessageHandOffState.atom, {
      threadId: currentAiChatThread,
      composerTextElement: editor.view.dom,
    });
  };

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: handOffSentMessage,
  });

  return null;
};
