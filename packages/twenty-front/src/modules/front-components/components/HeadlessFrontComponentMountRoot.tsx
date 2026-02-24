import { Suspense, lazy } from 'react';

import { useRecoilValue } from 'recoil';

import { mountedHeadlessFrontComponentIdsState } from '@/front-components/states/mountedHeadlessFrontComponentIdsState';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

export const HeadlessFrontComponentMountRoot = () => {
  const mountedHeadlessFrontComponentIds = useRecoilValue(
    mountedHeadlessFrontComponentIdsState,
  );

  if (mountedHeadlessFrontComponentIds.size === 0) {
    return null;
  }

  return (
    <>
      {[...mountedHeadlessFrontComponentIds].map((frontComponentId) => (
        <Suspense key={frontComponentId} fallback={null}>
          <FrontComponentRenderer frontComponentId={frontComponentId} />
        </Suspense>
      ))}
    </>
  );
};
