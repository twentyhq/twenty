import { useEffect } from 'react';

type RecordSharingRefreshEffectProps = {
  refetch: () => Promise<unknown>;
};

export const RecordSharingRefreshEffect = ({
  refetch,
}: RecordSharingRefreshEffectProps) => {
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
