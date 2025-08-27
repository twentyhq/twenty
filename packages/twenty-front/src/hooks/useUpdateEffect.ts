import { type DependencyList, type EffectCallback, useEffect } from 'react';

import { useFirstMountState } from './useFirstMountState';

export const useUpdateEffect = (
  effect: EffectCallback,
  deps?: DependencyList,
) => {
  const isFirst = useFirstMountState();

  useEffect(() => {
    if (!isFirst) {
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
