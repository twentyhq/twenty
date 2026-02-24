import { Suspense, lazy } from 'react';

import { mountedHeadlessFrontComponentIdsState } from '@/front-components/states/mountedHeadlessFrontComponentIdsState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

export const HeadlessFrontComponentMountRoot = () => {
  const mountedHeadlessFrontComponentIds = useRecoilValueV2(
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
