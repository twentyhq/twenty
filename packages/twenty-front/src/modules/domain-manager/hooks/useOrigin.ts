import { useMemo } from 'react';

export const useOrigin = () => {
  const origin = useMemo(() => window.location.origin, []);

  return { origin };
};
