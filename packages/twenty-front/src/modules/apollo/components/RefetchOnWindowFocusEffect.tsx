import { useEffect } from 'react';

type RefetchOnWindowFocusEffectProps = {
  refetch: () => Promise<unknown>;
};

export const RefetchOnWindowFocusEffect = ({
  refetch,
}: RefetchOnWindowFocusEffectProps) => {
  useEffect(() => {
    const refetchOnFocus = () => {
      if (document.visibilityState === 'visible') {
        void refetch().catch(() => {});
      }
    };

    window.addEventListener('focus', refetchOnFocus);

    return () => window.removeEventListener('focus', refetchOnFocus);
  }, [refetch]);

  return null;
};
