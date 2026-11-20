import { useContext, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai-chat/constants/AiChatRefetchMessagesEventName';
import { AiChatInstanceContext } from '@/ai-chat/contexts/AiChatInstanceContext';
import { type useAiChatFrontComponentPreview } from '@/ai-chat/tool-calls/hooks/useAiChatFrontComponentPreview';

type AiChatFrontComponentPreviewEffectProps = Pick<
  ReturnType<typeof useAiChatFrontComponentPreview>,
  'loadPreview'
>;

export const AiChatFrontComponentPreviewEffect = ({
  loadPreview,
}: AiChatFrontComponentPreviewEffectProps) => {
  const threadId = useContext(AiChatInstanceContext)?.threadId;

  useEffect(() => {
    let controller: AbortController | undefined;
    let hasPreview = false;
    const refreshPreview = async () => {
      controller?.abort();
      const requestController = new AbortController();
      controller = requestController;
      const loaded = await loadPreview({
        signal: requestController.signal,
        shouldLoadDependencies: !hasPreview,
      });
      if (!requestController.signal.aborted) {
        hasPreview = loaded || hasPreview;
      }
    };

    const handleRefetchMessages = (event: Event) => {
      const eventThreadId: unknown =
        event instanceof CustomEvent ? event.detail?.threadId : undefined;

      if (
        isDefined(threadId) &&
        isDefined(eventThreadId) &&
        eventThreadId !== threadId
      ) {
        return;
      }

      void refreshPreview();
    };

    void refreshPreview();
    window.addEventListener(
      AI_CHAT_REFETCH_MESSAGES_EVENT_NAME,
      handleRefetchMessages,
    );

    return () => {
      controller?.abort();
      window.removeEventListener(
        AI_CHAT_REFETCH_MESSAGES_EVENT_NAME,
        handleRefetchMessages,
      );
    };
  }, [loadPreview, threadId]);

  return null;
};
