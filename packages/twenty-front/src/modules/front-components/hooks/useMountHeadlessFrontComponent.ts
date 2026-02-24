import { useCallback } from 'react';

import { mountedHeadlessFrontComponentIdsState } from '@/front-components/states/mountedHeadlessFrontComponentIdsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

export const useMountHeadlessFrontComponent = () => {
  const mountHeadlessFrontComponent = useCallback(
    (frontComponentId: string) => {
      jotaiStore.set(
        mountedHeadlessFrontComponentIdsState.atom,
        (previousIds) => new Set(previousIds).add(frontComponentId),
      );
    },
    [],
  );

  return mountHeadlessFrontComponent;
};
