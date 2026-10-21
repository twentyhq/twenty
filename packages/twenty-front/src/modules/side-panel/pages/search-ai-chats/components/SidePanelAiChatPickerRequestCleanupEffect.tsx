import { useLayoutEffect } from 'react';

type SidePanelAiChatPickerRequestCleanupEffectProps = {
  pendingOpenRequests: Set<AbortController>;
};

export const SidePanelAiChatPickerRequestCleanupEffect = ({
  pendingOpenRequests,
}: SidePanelAiChatPickerRequestCleanupEffectProps) => {
  useLayoutEffect(() => {
    return () => {
      for (const request of pendingOpenRequests) {
        request.abort();
      }

      pendingOpenRequests.clear();
    };
  }, [pendingOpenRequests]);

  return null;
};
