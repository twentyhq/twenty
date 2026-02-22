import { useRecoilCallback } from 'recoil';

import { mountedHeadlessFrontComponentIdsState } from '@/front-components/states/mountedHeadlessFrontComponentIdsState';

export const useUnmountHeadlessFrontComponent = () => {
  const unmountHeadlessFrontComponent = useRecoilCallback(
    ({ set }) =>
      (frontComponentId: string) => {
        set(mountedHeadlessFrontComponentIdsState, (previousIds) => {
          const next = new Set(previousIds);
          next.delete(frontComponentId);
          return next;
        });
      },
    [],
  );

  return unmountHeadlessFrontComponent;
};
