import { useEffect } from 'react';

type AiChatSharingRefreshEffectProps = {
  refetch: () => Promise<unknown>;
};

export const AiChatSharingRefreshEffect = ({
  refetch,
}: AiChatSharingRefreshEffectProps) => {
  useEffect(() => {
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') {
        void refetch().catch(() => {});
      }
    };
    window.addEventListener('focus', refreshOnFocus);
    return () => window.removeEventListener('focus', refreshOnFocus);
  }, [refetch]);

  return null;
};
