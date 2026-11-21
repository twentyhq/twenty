import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAiChat } from '@/ai-chat/composer/hooks/useAiChat';
import { useIsAiChatComposerCentered } from '@/ai-chat/composer/hooks/useIsAiChatComposerCentered';
import { AiChatRuntimeContext } from '@/ai-chat/contexts/AiChatRuntimeContext';
import { dictationEngineComponentState } from '@/ai-chat/dictation/states/dictationEngineComponentState';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useIsAiChatRuntimeEnabled } from '@/ai-chat/hooks/useIsAiChatRuntimeEnabled';
import { aiChatSentMessageHandOffState } from '@/ai-chat/states/aiChatSentMessageHandOffState';
import { getTextBoundingClientRect } from '@/ai-chat/utils/getTextBoundingClientRect';

type AiChatComposerContent = {
  element: HTMLElement;
  text: string;
};

export const useSendAiChatComposerMessage = () => {
  const store = useStore();
  const { instanceId } = useAiChatInstanceOrThrow();
  const isAiChatRuntimeMounted = useContext(AiChatRuntimeContext);
  const isAiChatRuntimeEnabled = useIsAiChatRuntimeEnabled();
  const isComposerCentered = useIsAiChatComposerCentered();
  const { handleSendMessage } = useAiChat();

  const sendAiChatComposerMessage = useCallback(
    (composerContent?: AiChatComposerContent) => {
      if (!isAiChatRuntimeMounted || !isAiChatRuntimeEnabled) {
        return;
      }

      store
        .get(dictationEngineComponentState.atomFamily({ instanceId }))
        ?.cancel();

      if (!isComposerCentered) {
        store.set(aiChatSentMessageHandOffState.atom, null);
      } else if (
        isDefined(composerContent) &&
        isNonEmptyString(composerContent.text.trim())
      ) {
        store.set(aiChatSentMessageHandOffState.atom, {
          composerTextRect: getTextBoundingClientRect(composerContent.element),
          messageId: null,
        });
      }

      void handleSendMessage();
    },
    [
      handleSendMessage,
      instanceId,
      isAiChatRuntimeEnabled,
      isAiChatRuntimeMounted,
      isComposerCentered,
      store,
    ],
  );

  return { sendAiChatComposerMessage };
};
