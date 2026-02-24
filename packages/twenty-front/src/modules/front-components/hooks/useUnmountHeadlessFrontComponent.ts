import { useCallback } from 'react';

import { mountedHeadlessFrontComponentIdsState } from '@/front-components/states/mountedHeadlessFrontComponentIdsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

export const useUnmountHeadlessFrontComponent = () => {
  const unmountHeadlessFrontComponent = useCallback(
    (frontComponentId: string) => {
      jotaiStore.set(
        mountedHeadlessFrontComponentIdsState.atom,
        (previousIds) => {
          const next = new Set(previousIds);
          next.delete(frontComponentId);
          return next;
        },
      );
    },
    [],
  );

  return unmountHeadlessFrontComponent;
};
