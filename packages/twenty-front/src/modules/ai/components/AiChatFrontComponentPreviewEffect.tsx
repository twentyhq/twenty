import { useEffect } from 'react';

import { INBOX_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/InboxRefetchMessagesEventName';
import { type useAiChatFrontComponentPreview } from '@/ai/hooks/useAiChatFrontComponentPreview';

type AiChatFrontComponentPreviewEffectProps = Pick<
  ReturnType<typeof useAiChatFrontComponentPreview>,
  'loadPreview'
>;

export const AiChatFrontComponentPreviewEffect = ({
  loadPreview,
}: AiChatFrontComponentPreviewEffectProps) => {
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
    window.addEventListener(INBOX_REFETCH_MESSAGES_EVENT_NAME, refreshPreview);

    return () => {
      controller?.abort();
      window.removeEventListener(
        INBOX_REFETCH_MESSAGES_EVENT_NAME,
        refreshPreview,
      );
    };
  }, [loadPreview]);

  return null;
};
