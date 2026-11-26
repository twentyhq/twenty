import { useStore } from 'jotai';
import { useContext, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatInstanceContext } from '@/ai-chat/contexts/AiChatInstanceContext';
import { aiChatThreadFetchedMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadFetchedMessagesFamilyState';
import { type useAiChatFrontComponentPreview } from '@/ai-chat/tool-calls/hooks/useAiChatFrontComponentPreview';

type AiChatFrontComponentPreviewEffectProps = Pick<
  ReturnType<typeof useAiChatFrontComponentPreview>,
  'loadPreview'
>;

export const AiChatFrontComponentPreviewEffect = ({
  loadPreview,
}: AiChatFrontComponentPreviewEffectProps) => {
  const store = useStore();
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

    void refreshPreview();

    const unsubscribeFromFetchedMessages = isDefined(threadId)
      ? store.sub(
          aiChatThreadFetchedMessagesFamilyState.atomFamily({ threadId }),
          () => void refreshPreview(),
        )
      : undefined;

    return () => {
      controller?.abort();
      unsubscribeFromFetchedMessages?.();
    };
  }, [loadPreview, store, threadId]);

  return null;
};
