import { useRecoilCallback } from 'recoil';

import { mountedHeadlessFrontComponentIdsState } from '@/front-components/states/mountedHeadlessFrontComponentIdsState';

export const useMountHeadlessFrontComponent = () => {
  const mountHeadlessFrontComponent = useRecoilCallback(
    ({ set }) =>
      (frontComponentId: string) => {
        set(mountedHeadlessFrontComponentIdsState, (previousIds) =>
          new Set(previousIds).add(frontComponentId),
        );
      },
    [],
  );

  return mountHeadlessFrontComponent;
};
